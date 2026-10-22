# EduPulse: Master Viva Presentation & Live Demo Guide

This document is the definitive presentation script and live demonstration guide for the **EduPulse: AI-Powered Adaptive Learning & Student Performance Analytics Platform**. It is tailored for final-year engineering defense, project vivas, research paper presentations, and technical placement interviews.

---

## 1. Executive Summary & Problem Statement

### The Problem
Traditional Learning Management Systems (LMS) treat all students identically:
1. **Static Curriculum**: Every learner receives the exact same sequence of questions regardless of prior mastery or cognitive pace.
2. **Delayed Intervention**: Academic instructors discover student struggles only after midterm or semester exam failure when remediation is too late.
3. **Black-Box AI**: Modern generative tools often hallucinate answers or act as passive cheat tools without pedagogical grounding.

### The EduPulse Solution
EduPulse combines **Bayesian Knowledge Tracing (BKT)**, **Supervised Machine Learning (Random Forest)**, and **Multi-Tier AI Orchestration** into an end-to-end adaptive feedback loop:

```
[ Quiz Response / Academic Import ]
                │
                ▼
  [ Bayesian Knowledge Tracing (BKT) ] ──► Updates Topic Mastery P(L_t)
                │
                ▼
  [ Weak Topic Identification ] ───────► Triggers Directed Remediation
                │
                ▼
  [ Supervised At-Risk ML Model ] ──────► Predicts Drop-Out / Exam Risk
                │
                ▼
  [ Tri-Tier AI Assistant (Gemini/Groq/Ollama) ] ─► Socratic Explanations
```

---

## 2. 10-Minute Live Demo Flowchart & Viva Script

### Stage 1: Platform Overview & System Health (Minutes 0:00 - 1:30)
- **Action**: Open `http://localhost:5173`. Show the clean UI with role-based quick login pills.
- **Narrative**:
  > *"EduPulse is architected as a decoupled full-stack platform: React + Vite frontend, Java 17 Spring Boot 3 enterprise core with Spring Security and JWT, MySQL 8 relational schema with foreign key integrity, and a Python FastAPI microservice serving a Scikit-Learn Random Forest model."*
- **Verify**: Point out Swagger UI at `http://localhost:8080/swagger-ui.html` and FastAPI health check at `http://localhost:8001/health`.

### Stage 2: Student Experience & Adaptive BKT Engine (Minutes 1:30 - 4:00)
- **Action**: Click **"Student Demo"** (`student1@edupulse.local` / `Password@123`).
- **Show**:
  1. **Topic Mastery Heatmap**: Visualizes real-time mastery scores computed from past interactions.
  2. **Adaptive Quiz Taking**: Navigate to Quizzes (`/quizzes/1/attempt`).
  3. Answer a question incorrectly and explain how BKT penalizes the mastery prior using slip/guess parameters:
     $$P(L_t \mid \text{Incorrect}) = \frac{P(L_{t-1}) \cdot P(\text{Slip})}{P(L_{t-1}) \cdot P(\text{Slip}) + (1 - P(L_{t-1})) \cdot (1 - P(\text{Guess}))}$$
  4. Answer correctly on next attempt and observe mastery update:
     $$P(L_t) = P(L_{t \mid \text{obs}}) + (1 - P(L_{t \mid \text{obs}})) \cdot P(T)$$
  5. **Explain with AI**: Click "Explain with AI" on an incorrect answer. Show the provider-independent fallback mechanism (Gemini → Groq → Ollama) generating a pedagogical hint.

### Stage 3: Teacher Analytics & Class Interventions (Minutes 4:00 - 6:30)
- **Action**: Switch to **"Teacher Demo"** (`teacher.sarah@edupulse.local` / `Password@123`).
- **Show**:
  1. **Subject Cohort View**: Data Structures & Algorithms, Database Systems.
  2. **Topic Mastery Matrix**: Aggregates individual BKT parameters across all enrolled students to identify systemic curriculum blind spots (e.g., "B-Trees" vs "Arrays").
  3. **CSV Academic Import**: Navigate to `/import-academic`. Demonstrate CSV bulk upload of midterm marks and attendance with instant database transaction rollback on validation errors.
  4. **Quiz Creator**: Show question creation with dynamic difficulty weights and prerequisite linkings.

### Stage 4: Supervised ML Risk Prediction & Early Warning (Minutes 6:30 - 8:00)
- **Action**: Navigate to At-Risk Dashboard (`/at-risk`).
- **Narrative**:
  > *"While BKT models real-time conceptual mastery at the topic level, our supervised Random Forest classifier predicts macro-level academic jeopardy using longitudinal indicators: Attendance %, Quiz Average %, Assignment Marks, and Days of Inactivity."*
- **Show**:
  1. High Risk vs Medium vs Low Risk student badges.
  2. Live ML inference call to `http://localhost:8001/predict-risk` with sub-10ms response time.
  3. Mathematical fallback mechanism in Spring Boot if ML microservice is disconnected.

### Stage 5: Enterprise Governance, Settings & Institutional Reports (Minutes 8:00 - 10:00)
- **Action**: Switch to **"Admin Demo"** (`admin@edupulse.local` / `Password@123`).
- **Show**:
  1. **Class Management (`/admin/classes`)**: Create new sections, assign faculty, and enroll students.
  2. **Platform Settings (`/admin/settings`)**: Live tuning of BKT hyperparameters ($P(L_0), P(T), P(G), P(S)$), AI fallback order, and attendance risk thresholds without server redeployment.
  3. **Institutional Reports (`/admin/reports`)**: One-click download of institutional CSV exports (`All Students Master CSV`, `At-Risk Intervention CSV`, `Topic Mastery Matrix CSV`).
  4. **Security Audit Log (`/admin/audit-logs`)**: Complete immutable audit trail capturing logins, role modifications, CSV imports, and administrative actions with IP and timestamps.

---

## 3. Anticipated Viva & Interview Questions & Answers

### Q1: Why use Bayesian Knowledge Tracing (BKT) instead of Item Response Theory (IRT)?
**Answer**:
> *"IRT models student ability as a static latent trait ($\theta$) during a test. In contrast, BKT is a Hidden Markov Model (HMM) specifically designed to model learning over time as a transition between unlearned and learned states across consecutive attempts. Since EduPulse focuses on formative adaptive practice rather than summative evaluation, BKT provides instantaneous, interpretable probabilities for each individual knowledge component."*

### Q2: How does EduPulse prevent AI hallucination and vendor lock-in?
**Answer**:
> *"First, all AI prompts are strictly contextualized with deterministic student mastery data, quiz context, and curated pedagogical constraints; open-ended queries are forbidden. Second, our Spring Boot service uses a Provider-Chain abstraction pattern: if Google Gemini API quota is exhausted or offline, it cascades gracefully to Groq (Llama-3), then to a local Ollama instance, and finally to a deterministic rule-based template engine. The platform never crashes even in full offline mode."*

### Q3: What is the machine learning training pipeline for the at-risk model?
**Answer**:
> *"The Random Forest model is trained on historic student cohorts with 100 estimators. Features include Normalized Attendance (0-100), Internal Marks (0-100), Quiz Completion Rate, BKT Average Mastery, and Days Since Last Activity. It outputs both a categorical risk level (`HIGH`, `MEDIUM`, `LOW`) and a calibrated probability score. Feature importance analysis shows Attendance and Inactivity to be the two strongest leading indicators of student attrition."*

### Q4: How is database integrity and security ensured across roles?
**Answer**:
> *"We enforce defense-in-depth: stateless JWT tokens with SHA-256 signatures, BCrypt password hashing ($2^{10}$ rounds), Spring Security method-level `@PreAuthorize('hasRole(...)')` annotations on every API endpoint, JPA relational foreign key constraints, and an immutable `audit_events` table that tracks all privileged administrative and academic mutations."*

---

## 4. Default Demonstration Accounts

| Role | Email | Password | Primary Demo Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student1@edupulse.local` | `Password@123` | BKT Quizzes, Topic Mastery, AI Socratic Tutor, Weekly Summaries |
| **Teacher** | `teacher.sarah@edupulse.local` | `Password@123` | Topic Analytics Matrix, Academic CSV Upload, Quiz Authoring |
| **Admin** | `admin@edupulse.local` | `Password@123` | Class Cohorts, BKT Settings Tuning, Institutional CSVs, Audit Log |

---

*EduPulse was developed under a modular test-driven architecture, ensuring zero external paid dependencies and guaranteed local execution.*
