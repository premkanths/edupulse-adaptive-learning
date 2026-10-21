# 🚀 EduPulse Deployment & Production Guide

This guide covers how to deploy **EduPulse** to production environments, configure live Gmail SMTP email dispatch, and set up the multi-tier AI architecture.

---

## 🏗 Architecture Overview

EduPulse consists of 4 core services:

| Component | Technology | Default Port | Responsibility |
|---|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | `5173` (dev) / `80` (prod) | Student, Teacher & Admin dashboards |
| **Backend** | Spring Boot 3.3.4 (Java 21) | `8080` | REST API, security, AKT mastery tracking, email dispatch |
| **ML Microservice** | FastAPI, Python 3.11, Scikit-Learn | `8001` | Random Forest risk inference & AKT attention computation |
| **Database** | MySQL 8.0 | `3306` | Relational storage for users, quizzes, mastery, audit logs |

---

## ⚡ Option 1: One-Command Docker Compose Deployment (Recommended)

The easiest way to run EduPulse in production on any Linux server, VPS (AWS EC2, DigitalOcean, Hetzner, Linode), or local Docker installation.

### Step 1: Clone the Repository
```bash
git clone https://github.com/premkanths/edupulse-adaptive-learning.git
cd edupulse-adaptive-learning
```

### Step 2: Create Your Environment File (`.env`)
Create a `.env` file in the project root:
```ini
# Database
DB_NAME=edupulse
DB_USER=edupulse
DB_PASSWORD=your_secure_db_password

# Live Gmail SMTP (See Gmail guide below)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_16_char_app_password
MAIL_DRY_RUN=false

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### Step 3: Build & Launch All Containers
```bash
docker compose up -d --build
```

### Step 4: Verify Deployment
* **Web UI**: Open `http://your-server-ip/`
* **API Health Check**: `http://your-server-ip:8080/actuator/health`
* **ML Service Health**: `http://your-server-ip:8001/akt/health`

To stop: `docker compose down`

---

## ☁️ Option 2: Cloud PaaS Deployment (Vercel + Render / Railway)

If you prefer managed cloud hosting without configuring Linux servers:

### 1. Managed Database (Railway or Aiven)
1. Create a free/low-cost **MySQL 8.0** instance on [Railway.app](https://railway.app) or [Aiven.io](https://aiven.io).
2. Copy the connection host, port, database name, username, and password.

### 2. Python ML Service (Render or Railway)
1. Create a new **Web Service** pointing to directory `ml-service`.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port 8001`
4. Note your deployed ML URL (e.g., `https://edupulse-ml.onrender.com`).

### 3. Spring Boot Backend (Render or Railway)
1. Create a new **Web Service** pointing to directory `server`.
2. Select runtime: **Docker** (it automatically uses `server/Dockerfile`) OR **Java 21**.
3. Set Environment Variables:
   * `DB_HOST`: your MySQL host
   * `DB_PORT`: `3306`
   * `DB_NAME`: `edupulse`
   * `DB_USER`: your MySQL user
   * `DB_PASSWORD`: your MySQL password
   * `ML_SERVICE_URL`: your deployed ML URL from step 2
   * `SPRING_MAIL_USERNAME`: your Gmail address
   * `SPRING_MAIL_PASSWORD`: your Gmail App Password
   * `MAIL_DRY_RUN`: `false`
   * `GEMINI_API_KEY`: your Google Gemini API key
   * `GROQ_API_KEY`: your Groq API key
4. Note your deployed Backend URL (e.g., `https://edupulse-api.onrender.com`).

### 4. React Frontend (Vercel or Netlify)
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Environment Variable:
   * `VITE_API_URL`: `https://edupulse-api.onrender.com/api`
4. Click **Deploy**. Vercel will build the Vite assets and assign your global HTTPS domain.

---

## 📧 How to Setup Live Gmail Delivery (Why Emails Weren't Received)

By default, EduPulse runs in **`MAIL_DRY_RUN=true`** mode to protect local development and demo accounts (`@edupulse.local`). To receive actual emails in your real Gmail inbox:

### Step 1: Generate a Google App Password
1. Go to your **Google Account**: [myaccount.google.com/security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top of your Google Account, type **"App Passwords"** and click it.
4. Name the app **"EduPulse"** and click **Create**.
5. Google will display a **16-letter password** (e.g., `abcd efgh ijkl mnop`). Copy this without spaces.

### Step 2: Configure EduPulse with Your Gmail
In `server/src/main/resources/application-local.yml` (or your environment variables):
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_real_email@gmail.com
    password: abcdefghijklmnop      # The 16-character App Password

mail:
  dry-run: false
  allow-demo-accounts: true
```

### Step 3: Verify Live Delivery with 1 Click
1. Log in to EduPulse as **Admin** (`admin@edupulse.local` / `Password@123`).
2. On the **Admin Dashboard**, find the **Student Email Notifications & Weekly Summary System** card.
3. Type your personal Gmail address in the **"Send Live Test Email"** box and click **Send**.
4. Check your Gmail inbox (or spam folder) — you will receive the verified live test email instantly!

---

## 🔑 Demo Account Logins

All demo accounts share the password: **`Password@123`**

| Role | Email | Name |
|---|---|---|
| **Admin** | `admin@edupulse.local` | Dr. Robert Vance |
| **Teacher** | `teacher.sarah@edupulse.local` | Prof. Sarah Connor |
| **Teacher** | `teacher.alan@edupulse.local` | Prof. Alan Turing |
| **Student** | `student1@edupulse.local` | Aarav Sharma |
| **Student** | `student2@edupulse.local` | Ananya Patel |
| **Student** | `student3@edupulse.local` | Rohan Gupta |
