# EduPulse ML & Attentive Knowledge Tracing (AKT) Microservice

The **EduPulse ML Microservice** is a high-performance Python microservice powered by **FastAPI**, **PyTorch**, and **scikit-learn**. It provides two core cognitive engines to EduPulse:

1. **Attentive Knowledge Tracing (AKT)**: A state-of-the-art Transformer-based deep learning sequence model based on Ghosh et al. (KDD 2020) that traces student concept mastery and predicts future question performance with temporal attention.
2. **Multiclass Student Risk Prediction**: A calibrated Random Forest classification engine predicting student academic risk levels (Low, Moderate, High) with automated pedagogical diagnostic explanations and Gini feature contribution analysis.

---

## 🧠 1. Attentive Knowledge Tracing (AKT) Architecture

Traditional Bayesian Knowledge Tracing (BKT) assumes concept independence and simple Markovian state transitions. EduPulse implements **Attentive Knowledge Tracing** (*Ghosh et al., KDD 2020, arXiv:2007.12324*), which models non-linear knowledge acquisition through context-aware self-attention over long-term interaction sequences.

```
       Target Question (q_t, c_t)
                   │
                   ▼
┌──────────────────────────────────────────────┐
│         Question-Concept Embedding          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Decay-Aware Scaled Dot-Product Attention   │ ◄── Interaction Sequence
│    Softplus(γ) · Temporal Distance Decay    │     [(q_1, r_1), ..., (q_{t-1}, r_{t-1})]
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│   Continuous Latent State Representation     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Sigmoid Head ──► Mastery Probability [0, 1] │
└──────────────────────────────────────────────┘
```

### Key Technical Innovations
- **Decay-Aware Attention**: Incorporates a parameterized exponential distance penalty ($\exp(-\gamma |t - \tau|)$) where $\gamma = \text{softplus}(w) \ge 0$, preventing past interactions from exerting unphysical influence over long historical horizons.
- **Explainable Attended History**: Returns the top historical questions that most heavily influenced the current concept prediction, enabling explainable AI (XAI) for instructors.
- **Cold-Start Resilience**: Automatically falls back to prior concept difficulty distributions when a student attempts a diagnostic test for the first time.

### 🔬 Empirical Benchmark Results (7,553 Test Interactions)

Evaluated against the classic Corbett & Anderson Bayesian Knowledge Tracing (BKT) baseline on sequential response sequences:

| Metric | Classic BKT Baseline | EduPulse PyTorch AKT | Relative Improvement |
|---|---|---|---|
| **ROC-AUC** | `0.5880` | **`0.7625`** | **+29.68%** |
| **Accuracy** | `54.39%` | **`75.89%`** | **+39.53%** |
| **RMSE** | `0.4890` | **`0.4101`** | **-16.13% error reduction** |
| **Log Loss** | `0.6718` | **`0.5135`** | **-23.56% error reduction** |

---

## 🎯 2. Student Early Warning & Risk Prediction Model

The risk prediction engine identifies students needing academic intervention before exam deadlines.

### Performance Across Evaluated ML Models (1,500 samples, 300 test)

| Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| **Random Forest (Production)** | `94.33%` | `0.9460` | `0.9433` | `0.9434` | `0.9878` |
| **Gradient Boosting** | `96.00%` | `0.9602` | `0.9600` | `0.9599` | `0.9951` |
| **Decision Tree** | `89.67%` | `0.8999` | `0.8967` | `0.8961` | `0.9627` |
| **Logistic Regression** | `80.67%` | `0.8077` | `0.8067` | `0.8068` | `0.9285` |

### Feature Importance Weights (Gini Impurity)
- **Attendance Percentage**: `29.70%`
- **Quiz Average Score**: `27.53%`
- **Days Inactive on Platform**: `17.80%`
- **Knowledge Tracing (AKT) Mastery**: `17.63%`
- **Assignments Missed**: `7.34%`

---

## 📁 Directory Structure

```
ml-service/
├── akt/
│   ├── akt_model.py         # PyTorch nn.Module with DecayAwareAttention & AKTConfig
│   ├── akt_inference.py     # In-memory inference engine with batch prediction & top-attended extraction
│   ├── dataset.py           # Synthetic student interaction sequence generator & PyTorch Dataset
│   ├── train_akt.py         # 12-epoch training pipeline with AUC & early checkpointing
│   ├── akt_weights.pt       # Trained PyTorch model state dictionary
│   ├── akt_vocab.json       # Question & skill vocabulary index mappings
│   └── akt_metrics.json     # Persisted validation logs & BKT comparative benchmarks
├── main.py                  # FastAPI server with CORS, Pydantic schemas, and REST endpoints
├── train_model.py           # Multi-model benchmarking & Random Forest training script
├── test_akt.py              # Unit & integration test suite (shapes, monotonic decay, cold-start)
├── requirements.txt         # Python dependencies
├── risk_model.joblib        # Serialized scikit-learn Random Forest model
├── metrics.json             # Risk model metrics & confusion matrix
└── benchmark.json           # Comprehensive benchmark report across 4 ML algorithms
```

---

## 🔌 API Endpoints

### Health & Diagnostics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Overall health check for risk model and AKT engine |
| `GET` | `/akt/health` | Status of loaded PyTorch weights and vocabulary size |

### Attentive Knowledge Tracing (`/akt/**`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/akt/predict` | Predict probability of answering a specific target question correctly given historical interaction sequence |
| `POST` | `/akt/batch-predict` | Predict mastery across an entire array of curriculum topics in one forward pass |
| `GET` | `/akt/metrics` | Return training history, test AUC, and BKT comparative gains |

#### Sample `/akt/predict` Request Body
```json
{
  "student_id": 1,
  "history": [
    { "question_id": 1, "topic_id": 2, "is_correct": true },
    { "question_id": 2, "topic_id": 2, "is_correct": false },
    { "question_id": 5, "topic_id": 3, "is_correct": true }
  ],
  "target_question_id": 3,
  "target_topic_id": 2
}
```

#### Sample `/akt/predict` Response
```json
{
  "student_id": 1,
  "target_topic_id": 2,
  "target_question_id": 3,
  "mastery_probability": 0.742,
  "confidence": "HIGH",
  "history_length": 3,
  "attended_history": [
    { "question_id": 1, "is_correct": true, "attention_weight": 0.481 },
    { "question_id": 2, "is_correct": false, "attention_weight": 0.354 }
  ],
  "model": "Attentive Knowledge Tracing (AKT-v1)"
}
```

### Risk Prediction (`/predict`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Predict academic risk level (`LOW`, `MODERATE`, `HIGH`), risk score (0-100), and pedagogical reasons |
| `GET` | `/metrics` | Classification metrics (Accuracy, ROC-AUC, Precision, Recall, Confusion Matrix) |
| `GET` | `/benchmark` | Multi-algorithm benchmark comparison suite |
| `GET` | `/feature-importance` | Feature contribution breakdown |

#### Sample `/predict` Request Body
```json
{
  "quiz_average": 88.5,
  "attendance_pct": 100.0,
  "akt_avg_mastery": 0.48,
  "days_inactive": 1,
  "assignments_missed": 0
}
```

---

## 🚀 Setup & Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.11, 3.12, 3.13)
- PyTorch 2.0+

### 1. Install Dependencies
```bash
cd ml-service
pip install -r requirements.txt
pip install torch
```

### 2. Run Test Suite
```bash
python test_akt.py
```
*Executes unit tests verifying decay-aware attention, forward pass shapes, cold-start handling, and benchmark thresholds.*

### 3. (Optional) Retrain Models
To retrain the Random Forest risk model and regenerate `risk_model.joblib`:
```bash
python train_model.py
```

To retrain the PyTorch Attentive Knowledge Tracing model and regenerate `akt_weights.pt`:
```bash
python akt/train_akt.py
```

### 4. Start the Microservice
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

Once running, interactive FastAPI Swagger documentation will be available at:
```
http://127.0.0.1:8001/docs
```
