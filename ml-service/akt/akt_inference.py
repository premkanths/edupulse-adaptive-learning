import os
import json
import numpy as np
from typing import List, Dict, Optional, Tuple, Any

try:
    import torch
    HAS_TORCH = True
except ImportError:
    torch = None
    HAS_TORCH = False

try:
    if HAS_TORCH:
        from akt.akt_model import AttentiveKnowledgeTracing, AKTConfig
    else:
        AttentiveKnowledgeTracing = None
        AKTConfig = None
except ImportError:
    try:
        from akt_model import AttentiveKnowledgeTracing, AKTConfig
    except Exception:
        AttentiveKnowledgeTracing = None
        AKTConfig = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(BASE_DIR, "akt_weights.pt")
VOCAB_PATH = os.path.join(BASE_DIR, "akt_vocab.json")
METRICS_PATH = os.path.join(BASE_DIR, "akt_metrics.json")


class AKTInferenceEngine:
    def __init__(self, device: str = "cpu"):
        self.device = torch.device(device) if HAS_TORCH else None
        self.model: Optional[Any] = None
        self.vocab: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.q2idx: Dict[int, int] = {}
        self.s2idx: Dict[int, int] = {}
        self.q_to_skill: Dict[int, int] = {}
        self.is_loaded = False

        if HAS_TORCH:
            self.load()
        else:
            print("PyTorch is not available. AKT engine operating in algorithmic baseline mode.")

    def load(self):
        if not HAS_TORCH:
            print("PyTorch not installed. AKT neural weights cannot be loaded.")
            return

        if not os.path.exists(WEIGHTS_PATH) or not os.path.exists(VOCAB_PATH):
            print("AKT weights or vocab not found yet. Model will remain unloaded until training finishes.")
            return

        try:
            # Load Vocab
            with open(VOCAB_PATH, "r") as f:
                self.vocab = json.load(f)
            self.q2idx = {int(k): v for k, v in self.vocab.get("q2idx", {}).items()}
            self.s2idx = {int(k): v for k, v in self.vocab.get("s2idx", {}).items()}
            self.q_to_skill = {int(k): v for k, v in self.vocab.get("q_to_skill", {}).items()}

            # Load Checkpoint & Config
            checkpoint = torch.load(WEIGHTS_PATH, map_location=self.device)
            config = AKTConfig.from_dict(checkpoint["config"])
            self.model = AttentiveKnowledgeTracing(config).to(self.device)
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.eval()

            # Load Metrics
            if os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "r") as f:
                    self.metrics = json.load(f)

            self.is_loaded = True
            print(f"Successfully loaded AKT model (n_questions={config.n_questions}, n_skills={config.n_skills}, d_model={config.d_model})")
        except Exception as e:
            print(f"Error loading AKT model: {e}")
            self.is_loaded = False

    def _map_q_id(self, raw_q_id: int) -> int:
        if raw_q_id in self.q2idx:
            return self.q2idx[raw_q_id]
        n_q = self.vocab.get("n_questions", 120)
        return ((abs(hash(raw_q_id)) % n_q) + 1)

    def _map_s_id(self, raw_s_id: int) -> int:
        if raw_s_id in self.s2idx:
            return self.s2idx[raw_s_id]
        n_s = self.vocab.get("n_skills", 24)
        return ((abs(hash(raw_s_id)) % n_s) + 1)

    def predict_next(
        self,
        student_id: int,
        history: List[Dict[str, Any]],
        target_question_id: int,
        target_topic_id: int
    ) -> Dict[str, Any]:
        """
        Predicts student performance on a candidate target question/topic given historical sequence.
        history: list of dicts with keys: question_id, topic_id (or skill_id), is_correct (bool or 0/1)
        """
        if not HAS_TORCH or not self.is_loaded:
            if not self.is_loaded and HAS_TORCH:
                self.load()

            if not self.is_loaded or not HAS_TORCH:
                # Fallback to intelligent sequence baseline if PyTorch is not loaded
                if not history:
                    return {
                        "student_id": student_id,
                        "target_topic_id": target_topic_id,
                        "mastery_probability": 0.50,
                        "confidence": 0.30,
                        "state": "COLD_START",
                        "model": "AKT-fallback"
                    }
                topic_history = [h for h in history if h.get("topic_id") == target_topic_id or h.get("skill_id") == target_topic_id]
                eval_hist = topic_history if topic_history else history
                correct_cnt = sum(1 for h in eval_hist if h.get("is_correct") in (True, 1, "1", "true"))
                prob = round(float(np.clip(correct_cnt / max(len(eval_hist), 1), 0.10, 0.95)), 4)
                level = "MASTERED" if prob >= 0.80 else ("PROGRESSING" if prob >= 0.50 else "NEEDS_REINFORCEMENT")
                return {
                    "student_id": student_id,
                    "target_question_id": target_question_id,
                    "target_topic_id": target_topic_id,
                    "mastery_probability": prob,
                    "confidence": 0.50,
                    "mastery_level": level,
                    "attended_history": [],
                    "history_length": len(history),
                    "model": "AKT-algorithmic-baseline"
                }

        t_q_idx = self._map_q_id(target_question_id)
        t_s_idx = self._map_s_id(target_topic_id)

        # 1. Handle Cold-Start (empty history)
        if not history:
            prob, _ = self.model.predict_next(
                torch.tensor([], dtype=torch.long, device=self.device),
                torch.tensor([], dtype=torch.long, device=self.device),
                torch.tensor([], dtype=torch.long, device=self.device),
                t_q_idx,
                t_s_idx
            )
            prob = round(float(np.clip(prob, 0.01, 0.99)), 4)
            return {
                "student_id": student_id,
                "target_question_id": target_question_id,
                "target_topic_id": target_topic_id,
                "mastery_probability": prob,
                "confidence": 0.35,
                "mastery_level": "NEEDS_REINFORCEMENT" if prob < 0.50 else "PROGRESSING",
                "attended_history": [],
                "history_length": 0,
                "model": "Attentive Knowledge Tracing (AKT-v1)"
            }

        # 2. Sequential Prediction with Attention
        recent_history = history[-80:]
        q_ids = [self._map_q_id(h.get("question_id", 1)) for h in recent_history]
        s_ids = [self._map_s_id(h.get("topic_id", h.get("skill_id", 1))) for h in recent_history]
        r_ids = [2 if (h.get("is_correct") in (True, 1, "1", "true")) else 1 for h in recent_history]

        t_q = torch.tensor(q_ids, dtype=torch.long, device=self.device)
        t_s = torch.tensor(s_ids, dtype=torch.long, device=self.device)
        t_r = torch.tensor(r_ids, dtype=torch.long, device=self.device)

        prob, attn_weights = self.model.predict_next(t_q, t_s, t_r, t_q_idx, t_s_idx)
        prob = round(float(np.clip(prob, 0.01, 0.99)), 4)
        confidence = round(min(0.95, 0.40 + 0.55 * (len(recent_history) / 25.0)), 3)

        top_attended = []
        if attn_weights is not None:
            try:
                mean_weights = attn_weights[0, :, -1, :-1].mean(dim=0).cpu().numpy()
                top_indices = np.argsort(mean_weights)[::-1][:3]
                for idx in top_indices:
                    if idx < len(recent_history):
                        top_attended.append({
                            "step": int(idx + 1),
                            "question_id": recent_history[idx].get("question_id"),
                            "topic_id": recent_history[idx].get("topic_id", recent_history[idx].get("skill_id")),
                            "was_correct": bool(recent_history[idx].get("is_correct")),
                            "attention_weight": round(float(mean_weights[idx]), 4)
                        })
            except Exception:
                pass

        if prob >= 0.80:
            level = "MASTERED"
        elif prob >= 0.50:
            level = "PROGRESSING"
        else:
            level = "NEEDS_REINFORCEMENT"

        return {
            "student_id": student_id,
            "target_question_id": target_question_id,
            "target_topic_id": target_topic_id,
            "mastery_probability": prob,
            "confidence": confidence,
            "mastery_level": level,
            "attended_history": top_attended,
            "history_length": len(recent_history),
            "model": "Attentive Knowledge Tracing (AKT-v1)"
        }

    def batch_predict(
        self,
        student_id: int,
        history: List[Dict[str, Any]],
        target_topics: List[Dict[str, int]]
    ) -> List[Dict[str, Any]]:
        results = []
        for target in target_topics:
            t_topic_id = target.get("topic_id", 1)
            t_q_id = target.get("question_id", t_topic_id)
            res = self.predict_next(student_id, history, t_q_id, t_topic_id)
            results.append(res)
        return results

    def get_metrics(self) -> Dict[str, Any]:
        if not self.metrics and os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                self.metrics = json.load(f)
        return self.metrics or {
            "status": "baseline_active" if not self.is_loaded else "akt_loaded",
            "message": "Attentive Knowledge Tracing inference ready"
        }


# Global singleton instance
akt_engine = AKTInferenceEngine()
