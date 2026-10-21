import os
import json
import time
import math
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import roc_auc_score, log_loss, accuracy_score, mean_squared_error

from akt_model import AttentiveKnowledgeTracing, AKTConfig
from dataset import (
    generate_benchmark_kt_data,
    split_student_data,
    KTDataset,
    collate_kt_fn,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(BASE_DIR, "akt_weights.pt")
VOCAB_PATH = os.path.join(BASE_DIR, "akt_vocab.json")
METRICS_PATH = os.path.join(BASE_DIR, "akt_metrics.json")


class BKTBaselineEvaluator:
    """
    Standard Corbett & Anderson Bayesian Knowledge Tracing (BKT) baseline
    evaluated on the exact same test sequence data for rigorous empirical comparison.
    """
    def __init__(self, p_init=0.30, p_learn=0.20, p_guess=0.20, p_slip=0.10):
        self.p_init = p_init
        self.p_learn = p_learn
        self.p_guess = p_guess
        self.p_slip = p_slip

    def evaluate(self, test_students):
        y_true = []
        y_pred = []

        for student in test_students:
            # Per-skill mastery state
            skill_p = {}
            for inter in student["interactions"]:
                sk = inter.skill_id
                r = inter.correct

                p_known = skill_p.get(sk, self.p_init)
                # Predict probability of correct answer
                p_correct = p_known * (1.0 - self.p_slip) + (1.0 - p_known) * self.p_guess
                p_correct = np.clip(p_correct, 1e-4, 1.0 - 1e-4)

                y_true.append(r)
                y_pred.append(p_correct)

                # Update mastery using Bayes rule
                if r == 1:
                    post = (p_known * (1.0 - self.p_slip)) / (p_known * (1.0 - self.p_slip) + (1.0 - p_known) * self.p_guess)
                else:
                    post = (p_known * self.p_slip) / (p_known * self.p_slip + (1.0 - p_known) * (1.0 - self.p_guess))

                # Transition
                new_p = post + (1.0 - post) * self.p_learn
                skill_p[sk] = np.clip(new_p, 1e-4, 1.0 - 1e-4)

        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        auc = roc_auc_score(y_true, y_pred)
        loss = log_loss(y_true, y_pred)
        acc = accuracy_score(y_true, (y_pred >= 0.5).astype(int))
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))

        return {
            "model": "Bayesian Knowledge Tracing (Corbett & Anderson Baseline)",
            "auc": round(float(auc), 4),
            "logLoss": round(float(loss), 4),
            "accuracy": round(float(acc), 4),
            "rmse": round(float(rmse), 4),
            "total_interactions_evaluated": len(y_true)
        }


def evaluate_akt(model, dataloader, device):
    model.eval()
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for batch in dataloader:
            q = batch["q"].to(device)
            s = batch["s"].to(device)
            r = batch["r"].to(device)
            labels = batch["labels"].to(device)
            mask = batch["mask"].to(device)

            preds, _ = model(q, s, r)

            # Evaluate on all valid steps (mask is True and label >= 0)
            valid_mask = mask & (labels >= 0)
            v_preds = preds[valid_mask].cpu().numpy()
            v_labels = labels[valid_mask].cpu().numpy()

            all_preds.extend(v_preds)
            all_targets.extend(v_labels)

    all_preds = np.clip(np.array(all_preds), 1e-6, 1.0 - 1e-6)
    all_targets = np.array(all_targets)

    auc = roc_auc_score(all_targets, all_preds)
    loss = log_loss(all_targets, all_preds)
    acc = accuracy_score(all_targets, (all_preds >= 0.5).astype(int))
    rmse = np.sqrt(mean_squared_error(all_targets, all_preds))

    return {
        "auc": round(float(auc), 4),
        "logLoss": round(float(loss), 4),
        "accuracy": round(float(acc), 4),
        "rmse": round(float(rmse), 4),
        "sample_count": len(all_targets)
    }


def train_akt_pipeline(
    num_students: int = 1500,
    num_questions: int = 120,
    num_skills: int = 24,
    epochs: int = 12,
    batch_size: int = 32,
    lr: float = 0.001,
    device: str = "cpu"
):
    print(f"=== EduPulse AKT: Generating Benchmark Dataset ({num_students} students, {num_questions} questions) ===")
    dataset_info = generate_benchmark_kt_data(
        num_students=num_students,
        num_questions=num_questions,
        num_skills=num_skills,
        seed=42
    )

    # Question & Skill vocabularies
    q2idx = {q: q for q in range(1, num_questions + 1)}
    s2idx = {s: s for s in range(1, num_skills + 1)}

    # Student-level split: 80% train, 10% validation, 10% test
    train_students, val_students, test_students = split_student_data(
        dataset_info["students"], train_ratio=0.80, val_ratio=0.10, seed=42
    )
    print(f"Split sizes: Train={len(train_students)}, Val={len(val_students)}, Test={len(test_students)} students")

    train_ds = KTDataset(train_students, q2idx, s2idx, max_seq_len=80)
    val_ds = KTDataset(val_students, q2idx, s2idx, max_seq_len=80)
    test_ds = KTDataset(test_students, q2idx, s2idx, max_seq_len=80)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, collate_fn=collate_kt_fn)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, collate_fn=collate_kt_fn)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, collate_fn=collate_kt_fn)

    # Initialize AKT Model
    config = AKTConfig(
        n_questions=num_questions,
        n_skills=num_skills,
        d_model=64,
        n_heads=4,
        n_blocks=1,
        dropout=0.1,
        max_seq_len=80,
        decay_param=0.5
    )
    dev = torch.device(device)
    model = AttentiveKnowledgeTracing(config).to(dev)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)
    criterion = nn.BCELoss(reduction="none")

    print(f"=== Starting AKT Model Training ({epochs} epochs) ===")
    start_time = time.time()
    best_val_auc = 0.0
    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        total_tokens = 0

        for batch in train_loader:
            q = batch["q"].to(dev)
            s = batch["s"].to(dev)
            r = batch["r"].to(dev)
            labels = batch["labels"].to(dev)
            mask = batch["mask"].to(dev)

            optimizer.zero_grad()
            preds, _ = model(q, s, r)

            loss_all = criterion(preds, torch.clamp(labels, 0.0, 1.0))
            valid_mask = mask & (labels >= 0)
            loss = (loss_all * valid_mask.float()).sum() / (valid_mask.float().sum() + 1e-8)

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item() * valid_mask.sum().item()
            total_tokens += valid_mask.sum().item()

        avg_train_loss = total_loss / max(1, total_tokens)
        val_metrics = evaluate_akt(model, val_loader, dev)

        history.append({
            "epoch": epoch,
            "train_loss": round(avg_train_loss, 4),
            "val_auc": val_metrics["auc"],
            "val_log_loss": val_metrics["logLoss"],
            "val_accuracy": val_metrics["accuracy"]
        })

        print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {avg_train_loss:.4f} | Val AUC: {val_metrics['auc']:.4f} | Val LogLoss: {val_metrics['logLoss']:.4f} | Val Acc: {val_metrics['accuracy']:.4f}")

        if val_metrics["auc"] > best_val_auc:
            best_val_auc = val_metrics["auc"]
            torch.save({
                "model_state_dict": model.state_dict(),
                "config": config.to_dict(),
                "epoch": epoch,
                "best_val_auc": best_val_auc
            }, WEIGHTS_PATH)

    train_duration = round(time.time() - start_time, 2)
    print(f"Training completed in {train_duration}s. Best Val AUC: {best_val_auc:.4f}")

    # Load best checkpoint for final test evaluation
    checkpoint = torch.load(WEIGHTS_PATH, map_location=dev)
    model.load_state_dict(checkpoint["model_state_dict"])
    akt_test_metrics = evaluate_akt(model, test_loader, dev)
    print(f"\n=== Final AKT Test Set Evaluation ===")
    print(f"ROC-AUC:   {akt_test_metrics['auc']:.4f}")
    print(f"LogLoss:   {akt_test_metrics['logLoss']:.4f}")
    print(f"Accuracy:  {akt_test_metrics['accuracy']:.4f}")
    print(f"RMSE:      {akt_test_metrics['rmse']:.4f}")

    # Evaluate BKT Baseline on exact same test students
    print(f"\n=== Evaluating Baseline BKT on Held-out Test Set ===")
    bkt_evaluator = BKTBaselineEvaluator()
    bkt_test_metrics = bkt_evaluator.evaluate(test_students)
    print(f"BKT ROC-AUC:  {bkt_test_metrics['auc']:.4f}")
    print(f"BKT LogLoss:  {bkt_test_metrics['logLoss']:.4f}")
    print(f"BKT Accuracy: {bkt_test_metrics['accuracy']:.4f}")
    print(f"BKT RMSE:     {bkt_test_metrics['rmse']:.4f}")

    # Calculate comparative gains
    auc_gain_pct = round(((akt_test_metrics["auc"] - bkt_test_metrics["auc"]) / bkt_test_metrics["auc"]) * 100.0, 2)
    rmse_reduction_pct = round(((bkt_test_metrics["rmse"] - akt_test_metrics["rmse"]) / bkt_test_metrics["rmse"]) * 100.0, 2)
    logloss_reduction_pct = round(((bkt_test_metrics["logLoss"] - akt_test_metrics["logLoss"]) / bkt_test_metrics["logLoss"]) * 100.0, 2)

    # Save Vocab
    vocab_data = {
        "n_questions": num_questions,
        "n_skills": num_skills,
        "q2idx": {str(k): v for k, v in q2idx.items()},
        "s2idx": {str(k): v for k, v in s2idx.items()},
        "q_to_skill": {str(k): v for k, v in dataset_info["q_to_skill"].items()},
    }
    with open(VOCAB_PATH, "w") as f:
        json.dump(vocab_data, f, indent=2)

    # Save Metrics & Comparison
    full_metrics = {
        "model_architecture": "Attentive Knowledge Tracing (AKT)",
        "reference_paper": "Ghosh et al., KDD 2020 (arXiv:2007.12324)",
        "config": config.to_dict(),
        "training_time_seconds": train_duration,
        "total_training_epochs": epochs,
        "test_metrics": {
            "akt": {
                "model_name": "Attentive Knowledge Tracing (AKT)",
                "auc": akt_test_metrics["auc"],
                "logLoss": akt_test_metrics["logLoss"],
                "accuracy": akt_test_metrics["accuracy"],
                "rmse": akt_test_metrics["rmse"],
                "test_samples": akt_test_metrics["sample_count"],
            },
            "bkt_baseline": bkt_test_metrics,
            "comparison": {
                "auc_gain_percent": auc_gain_pct,
                "rmse_reduction_percent": rmse_reduction_pct,
                "logloss_reduction_percent": logloss_reduction_pct,
                "key_advantages": [
                    "Context-aware self-attention over long-term question interaction sequences",
                    "Monotonic temporal distance decay prevents historical decay bias",
                    "Continuous latent state representation captures cross-topic skill transfer"
                ]
            }
        },
        "training_history": history
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(full_metrics, f, indent=2)

    print(f"=== Successfully Saved Model Weights -> {WEIGHTS_PATH} ===")
    print(f"=== Successfully Saved Vocab -> {VOCAB_PATH} ===")
    print(f"=== Successfully Saved Metrics -> {METRICS_PATH} ===")
    return full_metrics


if __name__ == "__main__":
    train_akt_pipeline(num_students=1500, num_questions=120, num_skills=24, epochs=12, batch_size=32)
