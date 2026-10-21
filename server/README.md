# EduPulse Server — Spring Boot 3.3.4 Backend

The **EduPulse Server** is an enterprise-grade backend service built with **Spring Boot 3.3.4** and **Java 21/23**. It serves as the central hub of EduPulse, providing RESTful APIs, JWT role-based security, MySQL persistence, semantic course material parsing (RAG), and intelligent orchestration between the Python ML microservice (AKT & Random Forest) and a multi-tier LLM reasoning pipeline (Google Gemini, Groq LPUs, Local Ollama, and Rule-based Fallback).

---

## 🌟 Key Features & Architectural Responsibilities

### 1. Multi-Tier AI Provider Orchestration (`AiClientService`)
Implements an automated, resilient fallback hierarchy for generating contextual learning explanations, student cognitive syntheses, and personalized study action plans:
1. **Tier 1 — Google Gemini 3.8 Flash**: Primary multimodal cloud LLM delivering nuanced pedagogical feedback.
2. **Tier 2 — Groq LPUs (`openai/gpt-oss-120b`)**: Sub-second fast-inference fallback for high-throughput responses.
3. **Tier 3 — Local Ollama (`llama3`)**: Zero-cost, privacy-preserving on-premise inference when cloud connectivity is unavailable.
4. **Tier 4 — Deterministic Pedagogical Rules**: Pure algorithmic fallback ensuring 100% platform availability even during total AI outage.

### 2. Attentive Knowledge Tracing (AKT) Integration (`AktService`)
- Proxies sequence requests to the Python FastAPI microservice (`http://localhost:8001/akt/predict` & `/akt/batch-predict`).
- Persists granular interaction logs (question ID, skill ID, timestamp, correctness) per attempt.
- Updates real-time cognitive mastery probabilities across syllabus concepts.

### 3. Student Early Warning & Risk Prediction (`RiskPredictionService`)
- Integrates with the scikit-learn Random Forest model to calculate multidimensional academic risk (Low, Moderate, High).
- Weighs quiz mastery, continuous attendance percentage, assignment completion rate, and days of inactivity.

### 4. Semantic RAG & Course Material Pipeline (`CourseMaterialService`)
- Ingests instructor lecture notes, syllabus slides, and reference documents in **PDF** (Apache PDFBox) and **Office/Excel** formats (Apache POI).
- Chunks and indexes text to ground LLM-generated explanations strictly in classroom curriculum.

### 5. Automated Data Ingestion & Academic Records (`AcademicImportService`)
- Bulk imports institutional Excel and CSV records (internal assessments, midterm exams, semester GPA, daily attendance).
- Normalizes student metrics into uniform academic trajectories.

### 6. Scheduled Pedagogical Synthesis (`WeeklySummaryService`)
- Runs a scheduled Spring `@Scheduled` cron task (`0 0 6 * * MON`) to compute longitudinal mastery deltas and deliver personalized email summaries to learners and mentors.

---

## 🏗️ Technical Stack

- **Framework**: Spring Boot 3.3.4
- **Language**: Java 21 / 23
- **Database**: MySQL 8.0+ (with Hibernate 6 JPA)
- **Security**: Spring Security 6 with JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`)
- **Document Processing**: Apache PDFBox 3.0.3, Apache POI 5.3.0
- **API Documentation**: SpringDoc OpenAPI 2.6.0 (Swagger UI)
- **Build System**: Apache Maven 3.9+

---

## 📁 Package Structure

```
server/src/main/java/com/edupulse/
├── config/              # Security filter chain, CORS configuration, Swagger OpenAPI specs
├── controller/          # REST API endpoints (Student, Teacher, Auth, Research, Academic, Admin)
├── dto/                 # Request/Response Data Transfer Objects with Jakarta Validation
├── entity/              # JPA Database Entities (Users, Quizzes, Attempts, Mastery, Risk, Materials)
├── exception/           # Global exception handling & custom HTTP error responses
├── repository/          # Spring Data JPA repositories with custom JPQL queries
├── security/            # JWT authentication filter, token provider, UserDetailsService
├── seeder/              # Database seeder initializing test accounts, subjects, and sample quizzes
└── service/             # Business logic layer (AKT, AI fallback, BKT, Dashboard, Materials RAG)
```

---

## 🔌 Core API Endpoints

### Authentication & Profiles (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or teacher account | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user identity | Authenticated |

### Student Experience (`/api/student`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/student/dashboard` | Comprehensive dashboard metrics, mastery, and risk status | Student |
| `GET` | `/api/student/ai-summary` | Dynamic cognitive trajectory & student-friendly action plan | Student |
| `POST` | `/api/student/generate-summary` | On-demand trigger to recalculate latest AI cognitive synthesis | Student |
| `GET` | `/api/student/recommendations` | 4-step personalized practice and RAG material review items | Student |
| `GET` | `/api/student/subjects` | Enrolled subjects with topic breakdown and mastery scores | Student |
| `GET` | `/api/student/materials` | Teacher-uploaded lecture notes and study guides | Student |
| `POST` | `/api/student/quizzes/{id}/submit` | Submit quiz attempt; triggers AKT sequence update | Student |

### Instructor Portal (`/api/teacher`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/teacher/classes` | Classes and rosters managed by instructor | Teacher |
| `GET` | `/api/teacher/students/{id}/risk` | Detailed risk diagnostic and feature contributions | Teacher |
| `POST` | `/api/teacher/quizzes` | Create custom or AI-generated diagnostic quizzes | Teacher |
| `POST` | `/api/teacher/materials/upload` | Upload PDF/DOCX course materials for RAG ingestion | Teacher |

### Academic Ingestion & Institutional Data (`/api/academic-import`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/academic-import/upload` | Upload Excel/CSV spreadsheet with marks and attendance | Teacher / Admin |
| `GET` | `/api/academic-import/batches` | View status and logs of past batch imports | Teacher / Admin |

### Research Benchmark Suite (`/api/research`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/research/benchmark` | Compare AKT vs BKT vs DKT on AUC, Accuracy, and RMSE | Authenticated |
| `GET` | `/api/research/feature-importance` | Random Forest Gini feature importances | Authenticated |

---

## ⚙️ Configuration & Environment Variables

Configuration is defined in `src/main/resources/application.yml` and can be overridden by system environment variables or a local `application-local.yml` file (which is git-ignored for security).

### Essential Configuration Properties

| Property | Default Value | Description |
|---|---|---|
| `server.port` | `8080` | Port for the backend HTTP server |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/edupulse` | JDBC URL for MySQL database |
| `spring.datasource.username` | `edupulse` | Database username |
| `spring.datasource.password` | `edupulse` | Database password |
| `app.jwt.secret` | *(internal secure default)* | Secret key for HMAC-SHA512 token signing |
| `app.jwt.expiration-ms` | `86400000` (24h) | JWT validity window |
| `edupulse.ml-service.url` | `http://localhost:8001` | Base URL of the Python FastAPI ML microservice |
| `gemini.api-key` | `${GEMINI_API_KEY:}` | Google Gemini API key (Tier 1) |
| `gemini.model` | `gemini-3.8-flash` | Gemini model name |
| `groq.api-key` | `${GROQ_API_KEY:}` | Groq Cloud API key (Tier 2) |
| `groq.model` | `openai/gpt-oss-120b` | Groq high-speed LLM model identifier |
| `ollama.url` | `http://localhost:11434` | Local Ollama endpoint (Tier 3) |
| `ollama.model` | `llama3` | Local Ollama model name |

### Setting Up Local API Keys Safely
Create a file named `src/main/resources/application-local.yml` (this file is excluded by `.gitignore`):

```yaml
gemini:
  api-key: "YOUR_GEMINI_API_KEY"

groq:
  api-key: "YOUR_GROQ_API_KEY"
```

Or pass them as shell environment variables:
```bash
export GEMINI_API_KEY="your-gemini-key"
export GROQ_API_KEY="your-groq-key"
```

---

## 🚀 Running the Server

### Prerequisites
- **Java 21 or Java 23** JDK installed (`java -version`)
- **Apache Maven 3.9+** installed (`mvn -v`)
- **MySQL 8.0** running on port 3306 with database `edupulse`

### 1. Initialize MySQL Database
```sql
CREATE DATABASE IF NOT EXISTS edupulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'edupulse'@'localhost' IDENTIFIED BY 'edupulse';
GRANT ALL PRIVILEGES ON edupulse.* TO 'edupulse'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Build the Application
```bash
mvn clean package -DskipTests
```

### 3. Start the Server
```bash
mvn spring-boot:run
```

Once started, the backend will be listening at **`http://localhost:8080`**.

### 4. Interactive API Documentation (Swagger)
Open your browser and navigate to:
```
http://localhost:8080/swagger-ui.html
```
Interactive OpenAPI documentation will allow testing all endpoints with JWT authorization.

---

## 🧪 Default Test Accounts

On initial startup, `DatabaseSeeder.java` automatically initializes demo accounts:

| Role | Email | Password |
|---|---|---|
| **Student** | `aarav.sharma@edupulse.edu` | `Password123!` |
| **Teacher** | `priya.nair@edupulse.edu` | `Password123!` |
| **Administrator** | `admin@edupulse.edu` | `Password123!` |
