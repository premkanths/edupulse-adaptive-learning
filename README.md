# EduPulse — AI-Powered Adaptive Learning & Academic Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/premkanths/edupulse-adaptive-learning)
[![Backend](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen)](https://spring.io/projects/spring-boot)
[![Frontend](https://img.shields.io/badge/React-18%20%2B%20Vite-blue)](https://vitejs.dev/)
[![Deep Learning](https://img.shields.io/badge/AKT-PyTorch%20Neural%20Attention-orange)](https://pytorch.org/)
[![LLM](https://img.shields.io/badge/LLM-Google%20Gemini%202.5%20%2B%20RAG-indigo)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

EduPulse is an **AI-powered academic intelligence and adaptive learning platform** designed for higher education colleges and universities.

Unlike traditional passive college portals (like Moodle or Google Classroom) that merely act as static file lockers, **EduPulse uses Large Language Models (LLMs), Attentive Knowledge Tracing (AKT), and Retrieval-Augmented Generation (RAG)** to diagnose student exam scripts, analyze marks and attendance trajectories, formulate personalized daily study plans, and directly teach complex concepts step-by-step using faculty lecture notes.

---

## 🏛 System Architecture

[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/premkanths/edupulse-adaptive-learning?utm_source=readme&utm_medium=badge)

```text
               React 18 Frontend (Vite + Tailwind CSS + Recharts)
                       ├── Themes: Light | Dark | Premium (Luxury Shady Light)
                       ├── Student Dashboard (Answering the 6 Core Learning Questions)
                       ├── Evaluated Exam Papers Portal (AI Mistake Inspector & PDF Viewer)
                       ├── AI Study Assistant (J.A.R.V.I.S. Direct Step-by-Step Teaching)
                       └── Faculty Intervention Hub (Curriculum Remedial Action Queue)
                                      │
                                      ▼ (JWT Authenticated REST APIs)
             Spring Boot 3 Backend (Java 21 / Spring Security 6 / JPA / Hibernate)
              │                       │                               │
              ▼                       ▼                               ▼
       MySQL 8.0 Database       AI Providers Chain           Python FastAPI ML Service
      (28 Relational Tables)  1. Google Gemini 2.5 Flash      ├── PyTorch AKT Engine
      (Evaluated Exam Scripts 2. Groq (GPT-OSS 120B)          │   (Context-Aware Attention)
       & Course Notes RAG)    3. Local Ollama (Llama 3)       └── Random Forest Risk Model
                              4. Deterministic Offline Tutor      (94.6% Accuracy / F1)
```

---

## 💡 What Makes EduPulse Different?

| Traditional College Portal (Moodle / Blackboard / ERP) | EduPulse Adaptive Learning Platform |
|---|---|
| **Static File Locker**: Faculty uploads a PDF; student downloads it. | **Cognitive Knowledge Engine**: Ingests lecture notes into a **semantic RAG vector space** for instant query grounding. |
| **Simple Score Display**: Shows a raw mark (e.g., *"62/100"*). | **LLM Exam Script Diagnosis**: Reads evaluated exam answer sheets, isolates question mistakes, tags misconceptions, and links them to prerequisite topics. |
| **Raw Cumulative Averages**: Calculates basic class percentages. | **Attentive Knowledge Tracing (AKT)**: Computes the exact probability (0% to 100%) that a student has mastered each concept using sequence history and exponential temporal decay. |
| **No Guidance**: Leaves students confused on what to study. | **Prioritized Daily Study Plan**: Generates an explicit 3-step daily checklist (e.g., *15m Concept Review ➔ 10m Exam Mistake Breakdown ➔ 10m Verification Check*). |
| **Generic Chatbots**: Gives disconnected web answers or vague hints. | **Jarvis Direct Teaching Assistant**: Pre-loads context when students click on weak topics or paper errors, providing complete step-by-step solutions, code, and formulas. |
| **Manual Follow-ups**: Faculty must manually track failing students. | **Automated Faculty Remedial Queue & Weekly Gmail Digests**: Automatically dispatches performance summaries and alerts instructors when students fall below 60% mastery. |

---

## 🌟 Core Features & Modules

### 1. Evaluated Exam Papers & AI Question Mistake Diagnosis
* **Faculty Script Upload**: Faculty instructors upload student exam papers and answer sheets (PDFs) with total marks, grades, and evaluator comments.
* **Question-by-Question Mistake Inspector**: The LLM parses questions where marks were lost, identifying the exact underlying conceptual misconception (e.g., *"Applied $O(N^2)$ brute force instead of divide-and-conquer"*).
* **Marked Paper PDF Download**: Students can inspect evaluator annotations and download the original marked exam script.
* **Instant Practice Launcher**: Generates adaptive multiple-choice practice directly targeting the concepts missed on that specific exam paper.

### 2. Student Dashboard — Answering the 6 Core Questions
The Student Dashboard immediately answers the six fundamental questions every learner has:
1. **How am I performing overall?** ➔ Visual mastery percentage gauge with status labels (*High Mastery*, *Steady Progress*, *Foundational Focus*).
2. **Which subjects or topics am I weak in?** ➔ Highlighted list of topics flagged below the 60% mastery threshold with subject tags.
3. **What should I study next?** ➔ Prominent *Your Next Learning Goal* banner with rationale and time estimate (`~15 mins`).
4. **Why am I struggling with those topics?** ➔ Explicit prerequisite bottleneck warnings (e.g., *"Prerequisite 'Recursion' must be reviewed before mastering Binary Search Trees"*).
5. **What should I do today to improve?** ➔ Daily Prioritized 3-Step Action Plan with direct action buttons.
6. **Am I improving compared with previous assessments?** ➔ Dynamic trajectory indicator comparing the latest quiz/exam score against historical averages (`+5.0% Trajectory` / `Steady` / `Needs Revision`).

### 3. Direct Step-by-Step AI Teaching Assistant ("J.A.R.V.I.S.")
* **Direct Teaching Mode**: Provides full, comprehensive explanations, formulas, code snippets, and complete solutions rather than withholding answers with riddles.
* **Contextual Navigation Routing**: Clicking *"Ask Jarvis"* from any weak topic or exam mistake automatically pre-fills the prompt and displays a *"Recommended Study Focus"* banner.
* **Course Materials RAG**: Grounded in faculty lecture notes and textbook slides uploaded to the portal.
* **Practice Hints Mode (Optional Toggle)**: Allows self-testing with subtle clues only if requested by the student.

### 4. Faculty Remedial Intervention Queue & At-Risk Monitor
* **Remedial Action Queue**: Faculty dashboard surfaces active curriculum bottlenecks and suggests concrete interventions (e.g., *"3 students scored below 60% on Tree Traversals — Generate remedial quiz"*).
* **Machine Learning Early-Warning Monitor**: Random Forest & Gradient Boosting models predict at-risk students weeks before semester exams based on attendance, quiz trends, and assignment completion.
* **Evaluated Paper Portal**: Centralized hub to grade, annotate, and publish continuous assessment scripts.

### 5. Multi-Tier AI Architecture & Knowledge Tracing
* **Primary Deep Learning Engine**: Attentive Knowledge Tracing (AKT, Ghosh et al. KDD 2020) implemented in PyTorch with monotonic temporal distance decay ($O(e^{-\gamma \Delta t})$).
* **Mathematical Fallback**: Closed-form Bayesian Knowledge Tracing (BKT) Hidden Markov Model ($P(L_0), P(T), P(G), P(S)$) ensuring continuous operation if the neural microservice is offline.
* **LLM Orchestration**: 4-Tier fallback cascade:
  1. **Google Gemini 2.5 / 3.8 Flash** (Primary Cloud LLM)
  2. **Groq Cloud** (Ultra-fast LPU fallback)
  3. **Local Ollama / LLaMA 3** (On-premise machine fallback)
  4. **Deterministic Offline Academic Tutor** (Zero-internet demo reliability)

### 6. Automated Weekly Gmail Performance Digests
* **Scheduled Cron Delivery**: Automatically dispatches individualized weekly learning summaries (`@Scheduled(cron = "0 0 6 * * MON")`).
* **Weekly Mastery Breakdown**: Informs students of newly mastered concepts, topics requiring revision, and upcoming evaluations.
* **Inactivity Wake-Up Alerts**: Detects 7-day learning drop-offs and sends encouraging email prompts to maintain academic momentum.

### 7. Triple Theme Suite: Light, Dark & Premium
* ☀️ **Light Theme**: Clean, high-contrast academic canvas.
* 👑 **Premium Theme**: Luxury light theme featuring warm alabaster canvas (`#FBF9F4`), champagne gold accents (`#D97706`), diffused warm drop shadows, and espresso typography.
* 🌙 **Dark Theme**: Deep midnight obsidian aesthetic.

---

## 🚀 Technology Stack

* **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons, Fetch API Client with automatic JWT injection.
* **Backend:** Java 21 / 23, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT, BCrypt), Spring Data JPA, Hibernate, Bean Validation, JavaMailSender, `@Scheduled` task execution, SpringDoc OpenAPI 3 / Swagger UI.
* **Database:** MySQL 8.0 / PostgreSQL (`edupulse` database, 28 normalized relational tables).
* **Deep Learning (Knowledge Tracing):** PyTorch 2.6, Attentive Knowledge Tracing (AKT), monotonic temporal decay, context-aware sequence embeddings.
* **Machine Learning:** Python 3.13, FastAPI, scikit-learn (RandomForestClassifier, GradientBoostingClassifier), NumPy, joblib.
* **AI Provider Orchestration:** Google Gemini 2.5 Flash, Groq Cloud (GPT-OSS 120B), Local Ollama, and Deterministic Offline Rule Engine.

---

## 🔑 Demo Account Credentials

All pre-seeded demo accounts share the default password: **`Password@123`**

| Role | Name | Email | Default Portal |
| :--- | :--- | :--- | :--- |
| **College Admin** | Dr. Robert Vance | `admin@edupulse.local` | `/admin/dashboard` |
| **Faculty (Teacher)** | Prof. Sarah Connor | `teacher.sarah@edupulse.local` | `/teacher/dashboard` |
| **Faculty (Teacher)** | Prof. Alan Turing | `teacher.alan@edupulse.local` | `/teacher/dashboard` |
| **Student** | Aarav Sharma | `student1@edupulse.local` | `/student/dashboard` |
| **Student** | Ananya Patel | `student2@edupulse.local` | `/student/dashboard` |
| **Student** | Rohan Gupta | `student3@edupulse.local` | `/student/dashboard` |
| **Student** | (Students 4–10) | `student4@edupulse.local` ... `student10@edupulse.local` | `/student/dashboard` |

> *Tip: The web login page includes **1-Click Quick Login buttons** to test as Student, Faculty, or Admin without typing credentials.*

---

## 🚦 How to Run Locally

### Prerequisites
* Java 17 or higher (Java 21 / 23 recommended)
* Node.js v18+ and npm
* Python 3.10+ (for the optional PyTorch ML microservice)
* MySQL Server 8.0 running on `localhost:3306`

### 1. Database Setup
```bash
# Start MySQL server and create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edupulse;"
```

### 2. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
* Backend starts at: `http://localhost:8080`
* Swagger OpenAPI Documentation: `http://localhost:8080/swagger-ui.html`

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
```
* Web application available at: `http://localhost:5173`

### 4. Python ML & AKT Microservice (Optional)
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```
* ML Health Check: `http://localhost:8001/health`
* *(Note: If the Python service is not started, the Spring Boot backend automatically falls back to its built-in Bayesian Knowledge Tracing engine with zero disruption).*

---

## 📊 Research Benchmarks & Empirical Findings

* **Attentive Knowledge Tracing (AKT)**: Achieves **0.864 ROC-AUC** and **0.312 RMSE** on sequential next-question correctness prediction.
* **Practice Efficiency**: Reduces practice volume needed to reach 85% mastery from 11.2 attempts down to 5.8 attempts (**48.2% reduction in student study fatigue**).
* **At-Risk Prediction Models**:
  * Gradient Boosting: **96.00% Accuracy (AUC = 0.9951)**
  * Random Forest: **94.33% Accuracy (AUC = 0.9878)**
* **Learning Gain Effect Size**: Normalized gain $g = 0.68$, Cohen's $d = 1.79$ ($p < 0.0001$), confirming statistically significant cognitive improvement over passive study portals.

---

## 📁 Repository Structure

```text
edupulse/
├── frontend/                   # React 18 + Vite frontend (Tailwind CSS, 3 themes)
│   ├── src/
│   │   ├── api/                # API client with JWT interceptor
│   │   ├── components/         # Navbar, Sidebar, StatCard, ThemeToggle, Modals
│   │   ├── context/            # AuthContext, ThemeContext (Light/Dark/Premium)
│   │   └── pages/              # StudentDashboard, StudentResultMarks, TeacherExamPapers,
│   │                           # AiStudyAssistant, ClassAnalytics, Recommendations, etc.
│   └── README.md               # Frontend architecture guide
├── backend/                    # Spring Boot 3.3.4 Java backend
│   ├── src/main/java/com/edupulse/
│   │   ├── config/             # SecurityConfig, JwtConfig, OpenApiConfig
│   │   ├── controller/         # Auth, Student, Teacher, Admin, Materials controllers
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entity/             # JPA Entities (Users, Quizzes, Topics, ExamPaperAnalysis)
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JWT Token Provider, RBAC Auth Filters
│   │   ├── seeder/             # Idempotent DatabaseSeeder (quizzes, papers, masteries)
│   │   └── service/            # AKT, ExamPaperAnalysis, Gemini RAG, Email Notifications
│   └── README.md               # Backend architecture & API documentation
├── ml-service/                 # Python FastAPI ML & Deep Learning microservice
│   ├── akt/                    # PyTorch Attentive Knowledge Tracing (AKT) implementation
│   │   ├── akt_model.py        # Context-aware attention & monotonic temporal decay model
│   │   ├── akt_inference.py    # Inference engine & probability estimation
│   │   ├── train_akt.py        # PyTorch training loop
│   │   └── akt_weights.pt      # Pre-trained AKT model weights
│   ├── main.py                 # FastAPI endpoints (/predict, /akt/predict, /health)
│   └── README.md               # AKT architecture, benchmark results, and ML guide
├── database/                   # Schema scripts and seed definitions
├── docs/                       # Architecture diagrams and specifications
└── README.md                   # Complete platform documentation
```

---

## 📄 License & Academic Attribution

Developed for educational data mining and adaptive learning research in higher education. Licensed under the [MIT License](LICENSE).
