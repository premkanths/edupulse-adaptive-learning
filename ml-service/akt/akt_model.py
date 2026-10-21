import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class AKTConfig:
    def __init__(
        self,
        n_questions: int = 150,
        n_skills: int = 30,
        d_model: int = 64,
        n_heads: int = 4,
        n_blocks: int = 1,
        dropout: float = 0.1,
        max_seq_len: int = 100,
        decay_param: float = 0.5,
    ):
        self.n_questions = n_questions
        self.n_skills = n_skills
        self.d_model = d_model
        self.n_heads = n_heads
        self.n_blocks = n_blocks
        self.dropout = dropout
        self.max_seq_len = max_seq_len
        self.decay_param = decay_param

    def to_dict(self):
        return {
            "n_questions": self.n_questions,
            "n_skills": self.n_skills,
            "d_model": self.d_model,
            "n_heads": self.n_heads,
            "n_blocks": self.n_blocks,
            "dropout": self.dropout,
            "max_seq_len": self.max_seq_len,
            "decay_param": self.decay_param,
        }

    @classmethod
    def from_dict(cls, data):
        return cls(**data)


class DecayAwareAttention(nn.Module):
    """
    Context-Aware Attention with Monotonic Temporal Distance Decay.
    Reference: Ghosh et al., 'Context-Aware Attentive Knowledge Tracing' (KDD 2020), Section 3.2.
    Computes: Attention(Q, K, V) = Softmax( QK^T / sqrt(d) - gamma * D ) * V
    where D_ij = log(1 + |i - j|) and gamma >= 0 is a learnable decay parameter per head.
    """
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1, decay_init: float = 0.5):
        super().__init__()
        assert d_model % n_heads == 0, "d_model must be divisible by n_heads"
        self.d_model = d_model
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads

        self.w_q = nn.Linear(d_model, d_model, bias=False)
        self.w_k = nn.Linear(d_model, d_model, bias=False)
        self.w_v = nn.Linear(d_model, d_model, bias=False)
        self.w_out = nn.Linear(d_model, d_model, bias=False)

        # Learnable decay parameter gamma per head: gamma = softplus(raw_decay) >= 0
        self.raw_decay = nn.Parameter(torch.full((n_heads, 1, 1), decay_init))
        self.dropout = nn.Dropout(dropout)

    def forward(self, q, k, v, mask=None):
        batch_size, q_len, _ = q.shape
        _, k_len, _ = k.shape

        # Linear projections & split into heads: [B, H, L, d_k]
        Q = self.w_q(q).view(batch_size, q_len, self.n_heads, self.head_dim).transpose(1, 2)
        K = self.w_k(k).view(batch_size, k_len, self.n_heads, self.head_dim).transpose(1, 2)
        V = self.w_v(v).view(batch_size, k_len, self.n_heads, self.head_dim).transpose(1, 2)

        # Scaled dot-product: [B, H, q_len, k_len]
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.head_dim)

        # Temporal distance matrix D: D_ij = log(1 + |i - j|)
        q_pos = torch.arange(q_len, dtype=torch.float32, device=q.device).unsqueeze(1)
        k_pos = torch.arange(k_len, dtype=torch.float32, device=k.device).unsqueeze(0)
        dist = torch.log(1.0 + torch.abs(q_pos - k_pos))  # [q_len, k_len]
        dist = dist.unsqueeze(0).unsqueeze(0)             # [1, 1, q_len, k_len]

        gamma = F.softplus(self.raw_decay).unsqueeze(0)   # [1, H, 1, 1]
        scores = scores - gamma * dist

        # Causal mask (prevent future leakage) and padding mask
        if mask is not None:
            # mask expected shape: [B, 1, q_len, k_len] or broadcastable
            scores = scores.masked_fill(mask == 0, float("-inf"))

        attn_weights = F.softmax(scores, dim=-1)
        # Handle all-masked cases (avoid NaNs when full padding row)
        attn_weights = torch.nan_to_num(attn_weights, nan=0.0)
        attn_weights = self.dropout(attn_weights)

        # Weighted value sum: [B, H, q_len, d_k] -> [B, q_len, d_model]
        context = torch.matmul(attn_weights, V)
        context = context.transpose(1, 2).contiguous().view(batch_size, q_len, self.d_model)

        return self.w_out(context), attn_weights


class TransformerBlock(nn.Module):
    """
    AKT Transformer Block with pre-layer-normalization and temporal-decay attention.
    """
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1, decay_init: float = 0.5):
        super().__init__()
        self.attn = DecayAwareAttention(d_model, n_heads, dropout, decay_init)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)

        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model * 2, d_model),
            nn.Dropout(dropout),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, q, k, v, mask=None):
        # Self-attention / Cross-attention sublayer
        norm_q = self.norm1(q)
        norm_k = self.norm1(k) if k is not q else norm_q
        norm_v = self.norm1(v) if v is not q else norm_q

        attn_out, weights = self.attn(norm_q, norm_k, norm_v, mask)
        x = q + self.dropout(attn_out)

        # FFN sublayer
        x = x + self.ffn(self.norm2(x))
        return x, weights


class AttentiveKnowledgeTracing(nn.Module):
    """
    Attentive Knowledge Tracing (AKT) Model.
    Architecture based on Ghosh et al., KDD 2020 (arXiv:2007.12324).
    
    Components:
    1. Question Embedding (Question ID + Skill/Concept ID).
    2. Interaction Embedding (Question representation + Response 0/1 representation).
    3. Question Encoder: self-attention with causal decay over question sequence.
    4. Interaction Encoder: self-attention with causal decay over student interaction sequence.
    5. Knowledge Retriever: cross-attention querying student knowledge state at target step.
    6. Prediction MLP: predicts probability of correct answer P(r_{t+1}=1).
    """
    def __init__(self, config: AKTConfig):
        super().__init__()
        self.config = config

        # Index 0 is reserved for padding, so vocab size + 1
        self.q_embed = nn.Embedding(config.n_questions + 1, config.d_model, padding_idx=0)
        self.s_embed = nn.Embedding(config.n_skills + 1, config.d_model, padding_idx=0)
        self.r_embed = nn.Embedding(3, config.d_model, padding_idx=0)  # 0: pad, 1: incorrect (0), 2: correct (1)

        # Question Encoder Block(s)
        self.q_blocks = nn.ModuleList([
            TransformerBlock(config.d_model, config.n_heads, config.dropout, config.decay_param)
            for _ in range(config.n_blocks)
        ])

        # Interaction Encoder Block(s)
        self.i_blocks = nn.ModuleList([
            TransformerBlock(config.d_model, config.n_heads, config.dropout, config.decay_param)
            for _ in range(config.n_blocks)
        ])

        # Knowledge Retriever (Cross Attention: Query=Question Rep, Key/Value=Interaction Rep)
        self.retriever = TransformerBlock(config.d_model, config.n_heads, config.dropout, config.decay_param)

        # Output Prediction Head
        self.predict_head = nn.Sequential(
            nn.Linear(config.d_model * 2, config.d_model),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(config.d_model, 1),
        )

    def compute_question_rep(self, q_seq, s_seq):
        """
        Combines question and skill/concept representations: x_t = E_q(q_t) + E_s(s_t)
        """
        return self.q_embed(q_seq) + self.s_embed(s_seq)

    def compute_interaction_rep(self, q_rep, r_seq):
        """
        Combines question representation and response: y_t = x_t + E_r(r_t)
        r_seq: 1 for incorrect, 2 for correct, 0 for padding
        """
        return q_rep + self.r_embed(r_seq)

    def forward(self, q_seq, s_seq, r_seq, target_q=None, target_s=None):
        """
        Training forward pass across sequence (next-step prediction).
        q_seq: [B, T] question IDs
        s_seq: [B, T] skill/topic IDs
        r_seq: [B, T] responses encoded as 1 (incorrect), 2 (correct), 0 (pad)
        """
        B, T = q_seq.shape

        # 1. Embeddings
        q_rep = self.compute_question_rep(q_seq, s_seq)  # [B, T, d]
        i_rep = self.compute_interaction_rep(q_rep, r_seq) # [B, T, d]

        # 2. Causal + Padding Masks
        pad_mask = (q_seq != 0).unsqueeze(1).unsqueeze(2) # [B, 1, 1, T]
        causal_mask = torch.tril(torch.ones((T, T), device=q_seq.device, dtype=torch.bool)).unsqueeze(0).unsqueeze(0)
        self_mask = pad_mask & causal_mask # [B, 1, T, T]

        # 3. Encode Question Sequence: \tilde{x}_{1:T}
        x = q_rep
        for block in self.q_blocks:
            x, _ = block(x, x, x, mask=self_mask)

        # 4. Encode Interaction Sequence: \tilde{y}_{1:T}
        y = i_rep
        for block in self.i_blocks:
            y, _ = block(y, y, y, mask=self_mask)

        # 5. Knowledge Retrieval
        # At step t, predict for target question t.
        # Strict causality: Knowledge state for step t must only come from interactions strictly before t (1 to t-1).
        # We shift interactions or build a strictly lower triangular cross-attention mask.
        cross_causal_mask = torch.tril(torch.ones((T, T), device=q_seq.device, dtype=torch.bool), diagonal=-1).unsqueeze(0).unsqueeze(0)
        cross_mask = pad_mask & cross_causal_mask

        # For the very first question (t=0), there are no prior interactions (cross_mask is all False),
        # so retriever falls back to neutral prior representation.
        retrieved_h, weights = self.retriever(x, y, y, mask=cross_mask)

        # 6. Prediction
        combined = torch.cat([x, retrieved_h], dim=-1) # [B, T, 2*d]
        logits = self.predict_head(combined).squeeze(-1) # [B, T]
        preds = torch.sigmoid(logits)

        return preds, weights

    def predict_next(self, hist_q, hist_s, hist_r, target_q_id, target_s_id):
        """
        Inference on a student's historical sequence to predict performance on a target question.
        hist_q, hist_s, hist_r: 1D tensors of past interactions [T_hist]
        target_q_id, target_s_id: ints
        """
        self.eval()
        with torch.no_grad():
            T_hist = len(hist_q)
            if T_hist == 0:
                # Cold start: no history. Query target embeddings directly against baseline.
                t_q = torch.tensor([[target_q_id]], dtype=torch.long, device=self.q_embed.weight.device)
                t_s = torch.tensor([[target_s_id]], dtype=torch.long, device=self.s_embed.weight.device)
                q_rep = self.compute_question_rep(t_q, t_s)
                combined = torch.cat([q_rep, torch.zeros_like(q_rep)], dim=-1)
                prob = torch.sigmoid(self.predict_head(combined)).item()
                return float(prob), None

            # Construct sequence where last step is the candidate target question
            full_q = torch.cat([hist_q, torch.tensor([target_q_id], dtype=torch.long, device=hist_q.device)]).unsqueeze(0)
            full_s = torch.cat([hist_s, torch.tensor([target_s_id], dtype=torch.long, device=hist_s.device)]).unsqueeze(0)
            # Padded response for the target slot (dummy 0)
            full_r = torch.cat([hist_r, torch.tensor([0], dtype=torch.long, device=hist_r.device)]).unsqueeze(0)

            preds, weights = self.forward(full_q, full_s, full_r)
            target_prob = preds[0, -1].item()
            return float(target_prob), weights
