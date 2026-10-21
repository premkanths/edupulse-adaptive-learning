import os
import json
import random
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Dict, Tuple, Optional

class KTInteraction:
    def __init__(self, question_id: int, skill_id: int, correct: int, timestamp: int):
        self.question_id = question_id
        self.skill_id = skill_id
        self.correct = correct
        self.timestamp = timestamp

    def to_dict(self):
        return {
            "question_id": self.question_id,
            "skill_id": self.skill_id,
            "correct": self.correct,
            "timestamp": self.timestamp,
        }


def generate_benchmark_kt_data(
    num_students: int = 1200,
    num_questions: int = 120,
    num_skills: int = 24,
    min_seq_len: int = 15,
    max_seq_len: int = 80,
    seed: int = 42
) -> Dict[str, any]:
    """
    Generates a realistic educational interaction dataset formatted following
    standard Knowledge Tracing benchmarks (ASSISTments / EdNet sequence format).
    Each student interacts with questions linked to concepts/skills over time.
    Student latent ability, concept difficulty, learning transitions, and slip/guess
    govern responses, simulating authentic educational dynamics.
    """
    random.seed(seed)
    np.random.seed(seed)

    # Map questions to skills (each question belongs to 1-2 skills, predominantly 1)
    q_to_skill = {}
    q_difficulty = {}
    for q in range(1, num_questions + 1):
        q_to_skill[q] = ((q - 1) % num_skills) + 1
        q_difficulty[q] = np.random.normal(0.0, 1.0)

    students_data = []

    for s_id in range(1, num_students + 1):
        # Latent student ability
        student_ability = np.random.normal(0.2, 0.9)
        # Initial mastery per skill
        skill_mastery = {sk: (1.0 / (1.0 + np.exp(-(student_ability - np.random.uniform(-0.5, 0.5)))))
                         for sk in range(1, num_skills + 1)}
        
        seq_len = random.randint(min_seq_len, max_seq_len)
        interactions = []
        current_time = 1000 + random.randint(0, 500)

        for step in range(seq_len):
            # Pick a question (curriculum grouping or semi-sequential practice)
            # Mix focused topic practice and review
            if random.random() < 0.7:
                # Target active learning skill
                active_skill = ((step // 4) % num_skills) + 1
                candidate_questions = [q for q, sk in q_to_skill.items() if sk == active_skill]
                q_id = random.choice(candidate_questions) if candidate_questions else random.randint(1, num_questions)
            else:
                # Review question
                q_id = random.randint(1, num_questions)

            sk_id = q_to_skill[q_id]
            diff = q_difficulty[q_id]
            current_m = skill_mastery[sk_id]

            # IRT / KT probability of correct response: P(correct) = c + (1 - c - s) / (1 + exp(-(theta - beta)))
            guess = 0.18
            slip = 0.10
            logit = 2.2 * (student_ability + 1.2 * current_m - diff)
            p_raw = 1.0 / (1.0 + np.exp(-logit))
            p_correct = guess + (1.0 - guess - slip) * p_raw
            p_correct = float(np.clip(p_correct, 0.05, 0.95))

            is_correct = 1 if random.random() < p_correct else 0
            current_time += random.randint(30, 300)

            interactions.append(KTInteraction(q_id, sk_id, is_correct, current_time))

            # Learning transition: practicing increases mastery
            learn_rate = 0.12 if is_correct else 0.05
            skill_mastery[sk_id] = min(0.99, skill_mastery[sk_id] + learn_rate * (1.0 - skill_mastery[sk_id]))

        students_data.append({
            "student_id": s_id,
            "interactions": interactions,
        })

    return {
        "num_students": num_students,
        "num_questions": num_questions,
        "num_skills": num_skills,
        "q_to_skill": q_to_skill,
        "students": students_data,
    }


class KTDataset(Dataset):
    """
    PyTorch Dataset for Attentive Knowledge Tracing sequences.
    Splits long sequences into windows of max_seq_len with padding.
    """
    def __init__(
        self,
        student_records: List[Dict],
        q2idx: Dict[int, int],
        s2idx: Dict[int, int],
        max_seq_len: int = 100
    ):
        self.samples = []
        self.max_seq_len = max_seq_len

        for rec in student_records:
            inters = rec["interactions"]
            if len(inters) < 2:
                continue

            q_ids = [q2idx.get(it.question_id, 1) for it in inters]
            s_ids = [s2idx.get(it.skill_id, 1) for it in inters]
            # In AKT: response 1 = incorrect (0), 2 = correct (1), 0 = padding
            r_tokens = [2 if it.correct == 1 else 1 for it in inters]
            raw_labels = [it.correct for it in inters]

            # Slice into windows of max_seq_len if longer
            for i in range(0, len(inters), max_seq_len // 2):
                chunk_q = q_ids[i : i + max_seq_len]
                chunk_s = s_ids[i : i + max_seq_len]
                chunk_r = r_tokens[i : i + max_seq_len]
                chunk_labels = raw_labels[i : i + max_seq_len]

                if len(chunk_q) >= 2:
                    self.samples.append({
                        "student_id": rec["student_id"],
                        "q": chunk_q,
                        "s": chunk_s,
                        "r": chunk_r,
                        "labels": chunk_labels,
                    })
                if i + max_seq_len >= len(inters):
                    break

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        seq_len = len(item["q"])
        return {
            "q": torch.tensor(item["q"], dtype=torch.long),
            "s": torch.tensor(item["s"], dtype=torch.long),
            "r": torch.tensor(item["r"], dtype=torch.long),
            "labels": torch.tensor(item["labels"], dtype=torch.float32),
            "length": seq_len,
        }


def collate_kt_fn(batch):
    max_len = max(item["length"] for item in batch)
    B = len(batch)

    batch_q = torch.zeros((B, max_len), dtype=torch.long)
    batch_s = torch.zeros((B, max_len), dtype=torch.long)
    batch_r = torch.zeros((B, max_len), dtype=torch.long)
    batch_labels = torch.full((B, max_len), -1.0, dtype=torch.float32)  # -1 for ignore
    batch_mask = torch.zeros((B, max_len), dtype=torch.bool)

    for i, item in enumerate(batch):
        L = item["length"]
        batch_q[i, :L] = item["q"]
        batch_s[i, :L] = item["s"]
        batch_r[i, :L] = item["r"]
        batch_labels[i, :L] = item["labels"]
        batch_mask[i, :L] = True

    return {
        "q": batch_q,
        "s": batch_s,
        "r": batch_r,
        "labels": batch_labels,
        "mask": batch_mask,
    }


def split_student_data(
    students: List[Dict],
    train_ratio: float = 0.80,
    val_ratio: float = 0.10,
    seed: int = 42
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Student-level split strictly separating students into train, val, test.
    Guarantees zero data leakage across splits.
    """
    shuffled = list(students)
    random.seed(seed)
    random.shuffle(shuffled)

    n_total = len(shuffled)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)

    train_data = shuffled[:n_train]
    val_data = shuffled[n_train : n_train + n_val]
    test_data = shuffled[n_train + n_val :]

    return train_data, val_data, test_data
