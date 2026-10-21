import numpy as np
import json
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def generate_synthetic_data(num_samples=1200, random_seed=42):
    np.random.seed(random_seed)
    
    # Feature 1: Quiz average (0 - 100%)
    quiz_average = np.clip(np.random.normal(loc=68, scale=18, size=num_samples), 10, 100)
    
    # Feature 2: Attendance percentage (0 - 100%)
    attendance_pct = np.clip(np.random.normal(loc=78, scale=16, size=num_samples), 25, 100)
    
    # Feature 3: BKT Average Mastery (0.0 - 1.0), correlated with quiz score
    bkt_avg_mastery = np.clip((quiz_average / 100.0) * 0.7 + np.random.normal(0.15, 0.08, size=num_samples), 0.10, 0.99)
    
    # Feature 4: Days inactive (0 - 30 days)
    days_inactive = np.clip(np.random.exponential(scale=4.5, size=num_samples).astype(int), 0, 30)
    
    # Feature 5: Assignments missed (0 - 8)
    assignments_missed = np.clip(np.random.poisson(lam=1.2, size=num_samples), 0, 8)
    
    # Risk calculation: 0 = LOW, 1 = MODERATE, 2 = HIGH
    labels = []
    for q, att, bkt, inact, missed in zip(quiz_average, attendance_pct, bkt_avg_mastery, days_inactive, assignments_missed):
        risk_points = 0
        if q < 50: risk_points += 3
        elif q < 65: risk_points += 1
        
        if att < 70: risk_points += 3
        elif att < 80: risk_points += 1
        
        if bkt < 0.40: risk_points += 2
        elif bkt < 0.60: risk_points += 1
        
        if inact >= 10: risk_points += 3
        elif inact >= 5: risk_points += 1
        
        if missed >= 4: risk_points += 3
        elif missed >= 2: risk_points += 1
        
        if risk_points >= 5:
            labels.append(2) # HIGH
        elif risk_points >= 2:
            labels.append(1) # MODERATE
        else:
            labels.append(0) # LOW

    X = np.column_stack([quiz_average, attendance_pct, bkt_avg_mastery, days_inactive, assignments_missed])
    y = np.array(labels)
    return X, y

def train_and_export():
    print("Generating synthetic student academic performance dataset...")
    X, y = generate_synthetic_data()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    clf.fit(X_train, y_train)
    
    preds = clf.predict(X_test)
    
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, average='weighted', zero_division=0)
    rec = recall_score(y_test, preds, average='weighted', zero_division=0)
    f1 = f1_score(y_test, preds, average='weighted', zero_division=0)
    
    feature_names = ["quiz_average", "attendance_pct", "bkt_avg_mastery", "days_inactive", "assignments_missed"]
    importances = dict(zip(feature_names, [round(float(imp), 4) for imp in clf.feature_importances_]))
    
    metrics = {
        "model": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 6,
        "test_samples": len(y_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "feature_importances": importances
    }
    
    joblib.dump(clf, "ml-service/risk_model.joblib")
    with open("ml-service/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Model trained successfully! Accuracy: {acc*100:.2f}%, F1: {f1:.4f}")
    print(f"Metrics saved to ml-service/metrics.json")

if __name__ == "__main__":
    train_and_export()
