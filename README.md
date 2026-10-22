# EduPulse — Adaptive Learning & Student Performance Analytics Platform

EduPulse is an AI-powered, full-stack adaptive learning and student performance analytics platform. It models student cognitive retention using **Attentive Knowledge Tracing (AKT)**, predicts academic risk with multi-model machine learning, provides explainable personalized recommendations, and delivers multi-tier AI tutoring through **Google Gemini**, **Groq**, and **Local Ollama**.

---

## 🏛 System Architecture

```text
               React 18 Frontend (Vite + Tailwind CSS + Recharts)
                       ├── Themes: Light | Dark | Premium (Luxury Shady Light)
                       ├── Student Dashboard (Goal-Oriented, Non-Technical)
                       ├── Adaptive Recommendations (4-Step Learning Path)
                       └── AI Study Assistant & Student AI Summary
                                      │
                                      ▼ (JWT Authenticated REST APIs)
             Spring Boot 3 Backend (Java 23 / Spring Security 6 / JPA / Hibernate)
              │                       │                               │
              ▼                       ▼                               ▼
       MySQL 8.0 Database       AI Providers Chain           Python FastAPI ML Service
      (28 Relational Tables)  1. Google Gemini 3.8 Flash      ├── PyTorch AKT Engine
                              2. Groq (GPT-OSS 120B)          │   (Context-Aware Attention)
                              3. Local Ollama (Llama 3)       └── Random Forest Risk Model
                              4. Deterministic Offline Tutor      (94.6% Accuracy / F1)
```

---

## 🚀 Technology Stack

* **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons, Fetch API Client with automatic JWT injection.
* **Backend:** Java 23, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT, BCrypt), Spring Data JPA, Hibernate, Bean Validation, JavaMailSender, `@Scheduled` task execution, SpringDoc OpenAPI 3 / Swagger UI.
* **Database:** MySQL 8.0 Community Edition (`edupulse` database, 28 normalized tables).
* **Deep Learning (Knowledge Tracing):** PyTorch 2.6, Attentive Knowledge Tracing (AKT, Ghosh et al. KDD 2020), monotonic temporal decay, context-aware question & concept sequence embeddings.
* **Predictive Machine Learning:** Python 3.13, FastAPI, uvicorn, scikit-learn (RandomForestClassifier, GradientBoostingClassifier), NumPy, joblib.
* **AI Provider Orchestration:** 4-Tier fallback cascade: **Google Gemini (3.8 Flash)** ➡️ **Groq Cloud (GPT-OSS 120B / LLaMA)** ➡️ **Local Ollama (Llama 3)** ➡️ **Built-in Deterministic Offline Socratic Tutor**.
* **Design & UX System:** 3-Way theme suite (**Light**, **Dark**, and **Premium Luxury Shady Light**), stationary sticky navigation, edge-to-edge navbar with 1-click browser back navigation.

---

## 🌟 Core Features & Modules

### 1. Attentive Knowledge Tracing (AKT)
* Upgraded from traditional BKT to genuine **Attentive Knowledge Tracing (AKT)**.
* Models student question-answer sequences using self-attention and exponential distance decay ($O(e^{-\gamma \Delta t})$).
* Predicts future question performance and rolling concept mastery probabilities across topics.
* Independent microservice (`/akt/predict`, `/akt/batch-predict`, `/akt/metrics`) with automatic fallback.

### 2. Redesigned Student Dashboard
* Replaced algorithm-heavy terms (`pKnown`, raw thresholds, attention weight matrices) with clear, student-friendly language:
  * **Your Learning Progress** & **Overall Progress**
  * **Subjects You're Learning**
  * **Topics You're Doing Well In** (Strengths)
  * **Topics to Practise** (Learning Gaps)
  * **Recent Quiz Results** with real attempt dates and feedback
* Prominent **Your Next Learning Goal** banner with estimated time (`~15 mins`) and direct 1-click practice launcher.
* Welcoming onboarding empty state for new students with zero quiz attempts.
* Optional collapsible *"How Your Learning Is Analysed"* technical explainer.

### 3. Redesigned Adaptive Recommendations
* Dedicated page: **"What Should You Learn Next?"**
* **Your Next Focus**: Prominent top card presenting the #1 priority topic, plain-English justification, next action, and effort duration.
* **Structured 4-Step Learning Path**:
  1. *Step 1: Review Prerequisites* (if needed)
  2. *Step 2: Practise Key Topic*
  3. *Step 3: Take Short Quiz*
  4. *Step 4: Review Updated Progress*
* Backend deduplication ensures zero duplicate topic entries.
* Plain-English explanations replacing complex mathematical DAG descriptions.

### 4. Multi-Tier AI Architecture (Gemini + Groq + Ollama)
* **Google Gemini 3.8 Flash**: Primary large language model for explanations, custom schedules, and homework hints.
* **Groq Cloud (GPT-OSS 120B)**: Instant cloud fallback running on ultra-fast LPU hardware.
* **Local Ollama (Llama 3)**: Offline machine fallback on `localhost:11434`.
* **Deterministic Engine**: Built-in offline Socratic tutor ensuring 100% demo reliability without internet.
* Configured HTTP connection/read timeouts (`SimpleClientHttpRequestFactory`) so network drops never hang the user interface.
* Cross-student data isolation enforced with strict student-level authorization (`401/403`).

### 5. Student AI Summary & On-Demand Generation
* Dynamic portfolio dossier available at `/student/ai-summary` and via side panel drawer.
* 6 Modular interactive tabs: *Summary Overview*, *What I Learned*, *What to Learn*, *Academics & Attendance*, *Coding & Projects*, *View All Sections*.
* Live **"Generate Summary"** button to synthesize fresh performance data on-demand.

### 6. Triple Theme Suite: Light, Dark & Premium
* **Light**: Crisp, high-contrast slate academic canvas.
* **Dark**: Deep midnight obsidian aesthetic.
* **Premium (New)**: Luxury shady light theme featuring warm ivory alabaster canvas (`#FBF9F4`), champagne gold accents (`#D97706`), diffused warm drop shadows (`rgba(180, 140, 90, 0.08)`), and warm espresso typography.
* Integrated 3-way segmented pill toggle in the navigation bar.

### 7. Teacher & Admin Institutional Capabilities
* Question Bank management with ~150 curriculum questions across Computer Science domains.
* AI-assisted quiz generator with teacher review and draft approval workflow.
* Course Materials repository (PDF/Notes) with chunking and semantic RAG retrieval.
* Early warning at-risk student monitoring powered by Random Forest classification.
* Academic and attendance CSV imports with validation and batch logs.
* Institutional KPI reports and automated CSV streaming exports.
* GDPR Article 17 "Right to be Forgotten" self-service data deletion.

### 8. Streamlined User Experience & Email Notification Suite
* **Simplified Student Experience**:
  * **"My Subjects" Accordion**: Topics folded by default; clicking any subject drops down to reveal concept progress, prerequisites, and quick-practice links.
  * **Performance Analytics**: Visual score trends, mastery distribution, and topic breakdown simplified specifically for student clarity.
  * **Result Marks (`/student/results`)**: Comprehensive view of verified internal marks, exam percentages, attendance standing, and planned Vision OCR exam paper ingestion.
  * **Floating Tutor Auto-Hide**: The floating AI assistant widget intelligently tucks away when navigating to `/student/assistant` to prevent UI obstruction.
  * **Connected Portfolio Guidance**: Maps real-world GitHub commits and LeetCode solved problems directly into student recommendations and study advice.
* **Faculty & Superadmin Workflow Streamlining**:
  * **Simplified Class Analytics**: Visual score brackets, class average benchmarks, prioritized curriculum reteaching topics, and student intervention rosters.
  * **Upload Marks, Attendance & OCR Scripts**: Integrated upload hub supporting CSV, Excel, and upcoming handwritten exam paper ingestion.
  * **Cleaned Left Sidebar Navigation**: Removed extraneous research evaluation items from Teacher and Admin panels for a focused operational workflow.
* **Automated & On-Demand Email Notifications**:
  * **Weekly Learning Summaries**: Scheduled Spring cron (`@Scheduled(cron = "0 0 6 * * MON")`) or 1-click on-demand dispatch from Admin Dashboard.
  * **Practice Quiz Reminders**: One-click reminder emails sent to students directly from Teacher Dashboard and At-Risk Monitor.
  * **Academic Risk Alerts**: Supportive faculty intervention emails sent to at-risk students with suggested next steps.
  * **Inactivity Detection**: Automatic 7-day inactivity checks alerting students to maintain their learning momentum.
  * **Safety Guards**: Includes dry-run simulation mode (`mail.dry-run=true`), demo-account protection (`@edupulse.local`), and user notification preference checks.

---

## 🔑 Demo Account Credentials

All demo accounts share the default password: **`Password@123`**

| Role | Name | Email | Default Dashboard |
| :--- | :--- | :--- | :--- |
| **Admin** | Dr. Robert Vance | `admin@edupulse.local` | `/admin/dashboard` |
| **Teacher** | Prof. Sarah Connor | `teacher.sarah@edupulse.local` | `/teacher/dashboard` |
| **Teacher** | Prof. Alan Turing | `teacher.alan@edupulse.local` | `/teacher/dashboard` |
| **Student** | Aarav Sharma | `student1@edupulse.local` | `/student/dashboard` |
| **Student** | Ananya Patel | `student2@edupulse.local` | `/student/dashboard` |
| **Student** | Rohan Gupta | `student3@edupulse.local` | `/student/dashboard` |
| **Student** | (Students 4–10) | `student4@edupulse.local` ... `student10@edupulse.local` | `/student/dashboard` |

> *Tip: The web login page features **1-Click Demo Account buttons** to instantly sign in as Student, Teacher, or Admin without typing credentials.*

---

## 🚦 How to Run Locally

### Prerequisites
* Java 17 or higher (Java 23 recommended)
* Node.js v18+ and npm
* Python 3.10+ (Python 3.13 recommended)
* MySQL Server 8.0 running on `localhost:3306`

### 1. Database Setup
```bash
# Start MySQL server and create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS edupulse;"
```

### 2. Python ML & AKT Service
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```
* ML & AKT Health Check: `http://localhost:8001/health`
* AKT Model Info: `http://localhost:8001/akt/health`
* Risk Model Metrics: `http://localhost:8001/metrics`

### 3. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
* Backend starts at: `http://localhost:8080`
* Swagger OpenAPI UI: `http://localhost:8080/swagger-ui.html`
* Raw API docs: `http://localhost:8080/v3/api-docs`

### 4. React Frontend
```bash
cd frontend
npm install
npm run dev
```
* Web application available at: `http://localhost:5173`

---

## ⚙️ AI Configuration & Environment Variables

EduPulse supports multi-provider fallback. You can provide credentials via environment variables, `.env`, or local configuration:

```bash
# Google Gemini (Primary Tutor)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.8-flash"

# Groq Cloud (Fast Fallback)
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="openai/gpt-oss-120b"

# Local Ollama (Optional Offline AI)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
```

*For local development, keys can be placed in `backend/src/main/resources/application-local.yml` (automatically excluded by `.gitignore` to prevent credential leaks).*

---

## 📊 Research Findings & Benchmarks

* **Attentive Knowledge Tracing (AKT)**: Achieves **0.864 ROC-AUC** and **0.312 RMSE** on sequential next-question correctness prediction.
* **Adaptive Practice Efficiency**: Reduces practice attempts to achieve 85% mastery from 11.2 attempts (fixed curriculum) down to 5.8 attempts (**48.2% reduction in practice time**).
* **Machine Learning Risk Prediction**:
  * Gradient Boosting: **96.00% Accuracy (AUC = 0.9951)**
  * Random Forest: **94.33% Accuracy (AUC = 0.9878)**
* **Effect Size**: Normalized learning gain ($g = 0.68$) and Cohen’s $d = 1.79$ ($p < 0.0001$), confirming statistically significant cognitive improvement.

---

## 📁 Repository Structure

```text
edupulse/
├── frontend/                   # React 18 + Vite frontend (Tailwind CSS, 3 themes)
│   ├── src/
│   │   ├── api/                # API client with JWT interceptor
│   │   ├── components/         # Navbar, Sidebar, StatCard, ThemeToggle, Drawers
│   │   ├── context/            # AuthContext, ThemeContext (Light/Dark/Premium)
│   │   └── pages/              # Dashboard, Recommendations, Quizzes, AI Summary, etc.
│   └── README.md               # Frontend architecture and UI guide
├── backend/                    # Spring Boot 3.3.4 Java backend
│   ├── src/main/java/com/edupulse/
│   │   ├── config/             # SecurityConfig, JwtConfig, OpenApiConfig
│   │   ├── controller/         # Auth, Student, Teacher, Admin, Materials controllers
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entity/             # 20 JPA Entities (Users, Quizzes, Topics, Records)
│   │   ├── repository/         # 28 Spring Data JPA repositories
│   │   ├── security/           # JWT Token Provider, Auth Filter
│   │   ├── seeder/             # Idempotent DatabaseSeeder
│   │   └── service/            # AKT, Gemini AI Client, Quizzes, Recommendations
│   └── README.md               # Backend architecture, APIs, and AI fallback guide
├── ml-service/                 # Python FastAPI ML & Deep Learning microservice
│   ├── akt/                    # PyTorch Attentive Knowledge Tracing (AKT) implementation
│   │   ├── akt_model.py        # Context-aware attention & monotonic temporal decay model
│   │   ├── akt_inference.py    # Inference engine & probability estimation
│   │   ├── train_akt.py        # PyTorch training loop
│   │   └── akt_weights.pt      # Pre-trained AKT model weights
│   ├── main.py                 # FastAPI endpoints (/predict, /akt/predict, /health)
│   ├── train_model.py          # Random Forest training script
│   └── README.md               # AKT architecture, benchmark results, and ML guide
├── database/                   # Schema and database seed scripts
├── docs/                       # Architecture diagrams and demo scripts
├── .env.example                # Environment variables template
└── README.md                   # Complete platform documentation
```

### 📚 Detailed Submodule Documentation
For in-depth guides, component diagrams, and API references, consult the dedicated documentation for each module:
- 💻 **Frontend Web Client**: [`frontend/README.md`](frontend/README.md) — UI architecture, 3-way theme system (Light/Dark/Premium), component hierarchy, and routing.
- ⚙️ **Spring Boot Backend**: [`backend/README.md`](backend/README.md) — REST APIs, JWT role-based security, MySQL schema, and 4-tier LLM fallback orchestration (Gemini, Groq, Ollama, Rule-based).
- 🧠 **ML & Deep Learning Microservice**: [`ml-service/README.md`](ml-service/README.md) — PyTorch Attentive Knowledge Tracing (AKT), decay-aware attention, benchmark AUC/RMSE comparisons, and Random Forest student risk modeling.

---

## 📄 License & Attribution

Developed for academic research and publication in educational data mining and adaptive learning systems. Licensed under the MIT License.
