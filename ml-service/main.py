import os
import json
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from akt.akt_inference import akt_engine

app = FastAPI(title="EduPulse ML Risk Prediction & Attentive Knowledge Tracing Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")
BENCHMARK_PATH = os.path.join(os.path.dirname(__file__), "benchmark.json")

model = None

def load_or_train_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Loaded trained model from risk_model.joblib")
            return
        except Exception as e:
            print(f"Error loading model: {e}")
    
    print("Training new Random Forest model...")
    from train_model import train_and_export
    train_and_export()
    model = joblib.load(MODEL_PATH)

@app.on_event("startup")
def startup_event():
    load_or_train_model()
    if not akt_engine.is_loaded:
        akt_engine.load()

# ==========================================
# 1. Risk Prediction Models
# ==========================================

class RiskInput(BaseModel):
    quiz_average: float = Field(..., ge=0, le=100, description="Average quiz score percentage")
    attendance_pct: float = Field(..., ge=0, le=100, description="Attendance percentage")
    bkt_avg_mastery: Optional[float] = Field(default=None, description="Average Bayesian Knowledge Tracing mastery")
    akt_avg_mastery: Optional[float] = Field(default=None, description="Average Attentive Knowledge Tracing mastery")
    days_inactive: int = Field(..., ge=0, le=365, description="Number of days since last platform activity")
    assignments_missed: int = Field(default=0, ge=0, le=100, description="Number of missed assignments")

class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    reasons: List[str]
    model: str
    feature_contributions: Dict[str, float]

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "EduPulse ML Risk Prediction & AKT Service",
        "risk_model_loaded": model is not None,
        "akt_model_loaded": akt_engine.is_loaded
    }

@app.get("/metrics")
def get_metrics():
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    return {"message": "Metrics not generated yet"}

@app.get("/benchmark")
def get_benchmark():
    res = {}
    if os.path.exists(BENCHMARK_PATH):
        with open(BENCHMARK_PATH, "r") as f:
            res = json.load(f)
    akt_metrics = akt_engine.get_metrics()
    if akt_metrics and "test_metrics" in akt_metrics:
        res["knowledge_tracing_benchmark"] = akt_metrics
    return res

@app.get("/feature-importance")
def get_feature_importance():
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            data = json.load(f)
            return data.get("feature_importances", {})
    return {}

@app.post("/predict", response_model=RiskResponse)
def predict_risk(data: RiskInput):
    global model
    if model is None:
        load_or_train_model()
    
    # Use AKT mastery if provided, otherwise BKT mastery, otherwise 0.50 default
    mastery = data.akt_avg_mastery if data.akt_avg_mastery is not None else (
        data.bkt_avg_mastery if data.bkt_avg_mastery is not None else 0.50
    )
    
    features = np.array([[
        data.quiz_average,
        data.attendance_pct,
        mastery,
        data.days_inactive,
        data.assignments_missed
    ]])
    
    pred_class = int(model.predict(features)[0])
    probabilities = model.predict_proba(features)[0] # [P(Low), P(Mod), P(High)]
    
    # Calculate continuous risk score: 0 to 100
    if len(probabilities) == 3:
        risk_score = round(float(probabilities[1] * 50.0 + probabilities[2] * 100.0), 1)
    else:
        risk_score = 50.0

    level_map = {0: "LOW", 1: "MODERATE", 2: "HIGH"}
    risk_level = level_map.get(pred_class, "MODERATE")

    # Generate pedagogical reasons explaining the prediction
    reasons = []
    if data.quiz_average < 50.0:
        reasons.append(f"Quiz average is critically low ({data.quiz_average:.1f}%)")
    elif data.quiz_average < 65.0:
        reasons.append(f"Quiz average is below expected benchmark ({data.quiz_average:.1f}%)")

    if data.attendance_pct < 75.0:
        reasons.append(f"Attendance ({data.attendance_pct:.1f}%) is below the minimum 75% threshold")

    if mastery < 0.45:
        reasons.append(f"Knowledge Tracing mastery across topics is low ({mastery*100:.0f}%)")

    if data.days_inactive >= 7:
        reasons.append(f"Inactive for {data.days_inactive} consecutive days")

    if data.assignments_missed >= 2:
        reasons.append(f"Missed {data.assignments_missed} assessment deadlines")

    if not reasons:
        reasons.append("Academic progress, attendance, and quiz mastery are all on track")

    # Feature contribution breakdown
    feature_contributions = {
        "quiz_average": round(float(100.0 - data.quiz_average) * 0.35, 1),
        "attendance_pct": round(float(100.0 - data.attendance_pct) * 0.25, 1),
        "mastery": round(float((1.0 - mastery) * 100) * 0.20, 1),
        "days_inactive": round(float(min(data.days_inactive * 5.0, 100)) * 0.10, 1),
        "assignments_missed": round(float(min(data.assignments_missed * 20.0, 100)) * 0.10, 1),
    }

    return RiskResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        reasons=reasons,
        model="RandomForestClassifier-v1",
        feature_contributions=feature_contributions
    )


# ==========================================
# 2. Attentive Knowledge Tracing (AKT) Models & Endpoints
# ==========================================

class InteractionItem(BaseModel):
    question_id: int
    topic_id: Optional[int] = 1
    is_correct: bool
    timestamp: Optional[int] = None

class AKTPredictRequest(BaseModel):
    student_id: int
    history: List[InteractionItem] = []
    target_question_id: Optional[int] = 1
    target_topic_id: int

class TargetTopicItem(BaseModel):
    topic_id: int
    question_id: Optional[int] = None

class AKTBatchPredictRequest(BaseModel):
    student_id: int
    history: List[InteractionItem] = []
    target_topics: List[TargetTopicItem]

@app.get("/akt/health")
def akt_health():
    return {
        "status": "UP" if akt_engine.is_loaded else "DEGRADED",
        "model": "Attentive Knowledge Tracing (Ghosh et al. KDD 2020)",
        "is_loaded": akt_engine.is_loaded,
        "n_questions": akt_engine.vocab.get("n_questions", 120),
        "n_skills": akt_engine.vocab.get("n_skills", 24)
    }

@app.get("/akt/metrics")
def get_akt_metrics():
    return akt_engine.get_metrics()

@app.post("/akt/predict")
def predict_akt(data: AKTPredictRequest):
    history_dicts = [item.dict() for item in data.history]
    target_q = data.target_question_id if data.target_question_id is not None else data.target_topic_id
    result = akt_engine.predict_next(
        student_id=data.student_id,
        history=history_dicts,
        target_question_id=target_q,
        target_topic_id=data.target_topic_id
    )
    return result

@app.post("/akt/batch-predict")
def batch_predict_akt(data: AKTBatchPredictRequest):
    history_dicts = [item.dict() for item in data.history]
    target_dicts = [item.dict() for item in data.target_topics]
    results = akt_engine.batch_predict(
        student_id=data.student_id,
        history=history_dicts,
        target_topics=target_dicts
    )
    return {
        "student_id": data.student_id,
        "predictions": results,
        "model": "Attentive Knowledge Tracing (AKT-v1)"
    }
