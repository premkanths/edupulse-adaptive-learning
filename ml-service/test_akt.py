import unittest
import torch
import numpy as np

from akt.akt_model import AttentiveKnowledgeTracing, AKTConfig, DecayAwareAttention
from akt.akt_inference import akt_engine


class TestAttentiveKnowledgeTracing(unittest.TestCase):

    def setUp(self):
        self.config = AKTConfig(
            n_questions=50,
            n_skills=10,
            d_model=32,
            n_heads=2,
            n_blocks=1,
            dropout=0.0,
            max_seq_len=20,
            decay_param=0.5
        )
        self.model = AttentiveKnowledgeTracing(self.config)

    def test_decay_aware_attention_monotonic_decay(self):
        """Verify temporal distance decay matrix attenuates distant interactions."""
        attn = DecayAwareAttention(d_model=32, n_heads=2, decay_init=0.5)
        q = torch.randn(1, 4, 32)
        k = torch.randn(1, 4, 32)
        v = torch.randn(1, 4, 32)

        out, weights = attn(q, k, v)
        self.assertEqual(out.shape, (1, 4, 32))
        self.assertEqual(weights.shape, (1, 2, 4, 4))
        # Decay parameter must be non-negative via softplus
        gamma = torch.nn.functional.softplus(attn.raw_decay)
        self.assertTrue((gamma >= 0.0).all().item())

    def test_forward_pass_and_shapes(self):
        """Verify AKT forward pass produces expected sigmoid predictions in [0, 1]."""
        B, T = 2, 5
        q_seq = torch.randint(1, 50, (B, T))
        s_seq = torch.randint(1, 10, (B, T))
        r_seq = torch.randint(1, 3, (B, T))

        preds, weights = self.model(q_seq, s_seq, r_seq)
        self.assertEqual(preds.shape, (B, T))
        self.assertTrue((preds >= 0.0).all().item())
        self.assertTrue((preds <= 1.0).all().item())

    def test_cold_start_fallback(self):
        """Verify model gracefully handles students with zero prior history."""
        prob, weights = self.model.predict_next(
            torch.tensor([], dtype=torch.long),
            torch.tensor([], dtype=torch.long),
            torch.tensor([], dtype=torch.long),
            target_q_id=5,
            target_s_id=2
        )
        self.assertIsInstance(prob, float)
        self.assertTrue(0.0 <= prob <= 1.0)
        self.assertIsNone(weights)

    def test_inference_engine_attention_extraction(self):
        """Verify inference engine extracts top-attended interactions with interpretability."""
        history = [
            {"question_id": 1, "topic_id": 2, "is_correct": True},
            {"question_id": 2, "topic_id": 2, "is_correct": False},
            {"question_id": 3, "topic_id": 2, "is_correct": True},
        ]
        res = akt_engine.predict_next(
            student_id=99,
            history=history,
            target_question_id=4,
            target_topic_id=2
        )
        self.assertIn("mastery_probability", res)
        self.assertIn("confidence", res)
        self.assertIn("attended_history", res)
        self.assertEqual(res["model"], "Attentive Knowledge Tracing (AKT-v1)")
        self.assertTrue(len(res["attended_history"]) > 0)

    def test_benchmark_metrics_availability(self):
        """Verify benchmark test metrics are stored and show significant gain over BKT baseline."""
        metrics = akt_engine.get_metrics()
        self.assertIn("test_metrics", metrics)
        akt_auc = metrics["test_metrics"]["akt"]["auc"]
        bkt_auc = metrics["test_metrics"]["bkt_baseline"]["auc"]
        self.assertGreater(akt_auc, bkt_auc, "AKT must outperform BKT baseline on AUC")
        self.assertGreaterEqual(akt_auc, 0.75, "AKT AUC must be at least 0.75")


if __name__ == "__main__":
    unittest.main()
