import os
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

def generate_synthetic_data(num_samples=1500, random_seed=42):
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
    
    # Ground Truth Multi-class Risk: 0 = LOW, 1 = MODERATE, 2 = HIGH
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
    print("Generating comprehensive multi-cohort student dataset (N=1,500)...")
    X, y = generate_synthetic_data()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    models = {
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
        "DecisionTreeClassifier": DecisionTreeClassifier(max_depth=6, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=500, random_state=42)
    }
    
    results = {}
    best_f1 = -1
    best_clf = None
    
    feature_names = ["quiz_average", "attendance_pct", "bkt_avg_mastery", "days_inactive", "assignments_missed"]
    
    for name, clf in models.items():
        clf.fit(X_train, y_train)
        preds = clf.predict(X_test)
        
        try:
            probs = clf.predict_proba(X_test)
            auc = roc_auc_score(y_test, probs, multi_class='ovr', average='weighted')
        except Exception:
            auc = 0.5
            
        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds, average='weighted', zero_division=0)
        rec = recall_score(y_test, preds, average='weighted', zero_division=0)
        f1 = f1_score(y_test, preds, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, preds).tolist()
        
        results[name] = {
            "model_name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "confusion_matrix": cm
        }
        
        if f1 > best_f1:
            best_f1 = f1
            best_clf = clf

    # Extract feature importance from best ensemble (Random Forest)
    rf = models["RandomForestClassifier"]
    rf_importances = dict(zip(feature_names, [round(float(imp), 4) for imp in rf.feature_importances_]))
    
    # Export production model (Random Forest)
    current_dir = os.path.dirname(__file__)
    model_export_path = os.path.join(current_dir, "risk_model.joblib")
    metrics_export_path = os.path.join(current_dir, "metrics.json")
    benchmark_export_path = os.path.join(current_dir, "benchmark.json")
    
    joblib.dump(rf, model_export_path)
    
    production_metrics = {
        "model": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 6,
        "test_samples": len(y_test),
        "accuracy": results["RandomForestClassifier"]["accuracy"],
        "precision": results["RandomForestClassifier"]["precision"],
        "recall": results["RandomForestClassifier"]["recall"],
        "f1_score": results["RandomForestClassifier"]["f1_score"],
        "roc_auc": results["RandomForestClassifier"]["roc_auc"],
        "confusion_matrix": results["RandomForestClassifier"]["confusion_matrix"],
        "feature_importances": rf_importances
    }
    
    with open(metrics_export_path, "w") as f:
        json.dump(production_metrics, f, indent=2)
        
    benchmark_data = {
        "dataset": {
            "total_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_names,
            "target_classes": ["LOW", "MODERATE", "HIGH"]
        },
        "models_comparison": results,
        "feature_importances": rf_importances
    }
    
    with open(benchmark_export_path, "w") as f:
        json.dump(benchmark_data, f, indent=2)
        
    print(f"Multi-Model Benchmark generated successfully!")
    for name, m in results.items():
        print(f" - {name:28s}: Accuracy={m['accuracy']*100:.2f}%, F1={m['f1_score']:.4f}, AUC={m['roc_auc']:.4f}")

if __name__ == "__main__":
    train_and_export()
