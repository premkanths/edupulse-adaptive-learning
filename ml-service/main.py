import os
import json
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

app = FastAPI(title="EduPulse ML Risk Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")

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

class RiskInput(BaseModel):
    quiz_average: float = Field(..., ge=0, le=100, description="Average quiz score percentage")
    attendance_pct: float = Field(..., ge=0, le=100, description="Attendance percentage")
    bkt_avg_mastery: float = Field(..., ge=0, le=1.0, description="Average Bayesian Knowledge Tracing mastery")
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
        "service": "EduPulse ML Risk Prediction Service",
        "model_loaded": model is not None
    }

@app.get("/metrics")
def get_metrics():
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    return {"message": "Metrics not generated yet"}

@app.post("/predict", response_model=RiskResponse)
def predict_risk(data: RiskInput):
    global model
    if model is None:
        load_or_train_model()
    
    features = np.array([[
        data.quiz_average,
        data.attendance_pct,
        data.bkt_avg_mastery,
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

    if data.bkt_avg_mastery < 0.45:
        reasons.append(f"Bayesian Knowledge Tracing mastery across topics is low ({data.bkt_avg_mastery*100:.0f}%)")

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
        "bkt_avg_mastery": round(float((1.0 - data.bkt_avg_mastery) * 100) * 0.20, 1),
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
