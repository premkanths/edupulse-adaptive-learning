# EduPulse Frontend (`client`)

The web frontend for **EduPulse — Adaptive Learning & Student Performance Analytics Platform**. Built with React 18, Vite, Tailwind CSS, Recharts, and Lucide Icons.

---

## 🎨 Key Features

* **Student Experience**:
  * **Student Dashboard**: Goal-oriented layout presenting overall progress, active subjects, strengths, topics to practise, recent quiz results, and the prominent *"Your Next Learning Goal"* card.
  * **Adaptive Recommendations**: *"What Should You Learn Next?"* featuring a prominent priority focus card and a structured 4-step learning path.
  * **Student AI Summary**: Comprehensive academic and extracurricular portfolio with on-demand AI synthesis generation.
  * **AI Study Assistant (J.A.R.V.I.S.)**: Interactive chat with explanatory and Socratic tutoring modes grounded in teacher course materials.
  * **Course Materials**: Student access to teacher-uploaded notes and slides with inline study guides.
* **Faculty & Administrator Experience**:
  * **Teacher Dashboard**: Question bank management, quiz creation, AI quiz generation, at-risk student monitoring, and cohort analytics.
  * **Admin Dashboard**: Class cohorts management, user lifecycle controls, audit logs, and institutional CSV streaming reports.
* **Theme Suite**:
  * ☀️ **Light**: Clean high-contrast academic slate.
  * 👑 **Premium**: Luxury light theme with warm alabaster canvas (`#FBF9F4`), champagne gold accents (`#D97706`), diffused warm shady elevation (`rgba(180, 140, 90, 0.08)`), and warm espresso typography.
  * 🌙 **Dark**: Deep midnight obsidian aesthetic.
  * Controlled via the 3-way segmented pill toggle in the navigation bar.

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18 or higher
* npm v9 or higher

### Installation
```bash
# Install dependencies
npm install

# Start development server with Hot Module Replacement (HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The application runs on `http://127.0.0.1:5173/` by default and proxies REST API requests to `http://127.0.0.1:8080/api`.

---

## 📁 Source Directory Structure

```text
src/
├── api/                # Centralized Fetch API client with automatic JWT bearer injection
├── components/         # Reusable UI components
│   ├── ui/             # Button, Card, Badge, ThemeToggle
│   ├── Navbar.jsx      # Edge-to-edge navbar with 1-click back button and theme toggle
│   ├── Sidebar.jsx     # Sticky pinned navigation with profile identity badge
│   └── StudentAiSummaryDrawer.jsx
├── context/            # Global React Contexts
│   ├── AuthContext.jsx # User authentication, token persistence, and role guards
│   └── ThemeContext.jsx# 3-Way theme switcher (light / dark / premium)
├── pages/              # Role-specific and general pages
│   ├── StudentDashboard.jsx
│   ├── Recommendations.jsx
│   ├── StudentAiSummary.jsx
│   ├── StudentMaterials.jsx
│   ├── AiStudyAssistant.jsx
│   ├── LandingPage.jsx
│   ├── Login.jsx & Register.jsx
│   └── ... (Admin & Teacher pages)
├── services/           # Axios / fetch service utilities
├── App.jsx             # Role-based route definitions and ProtectedRoute guards
└── index.css           # Tailwind directives and custom theme variables
```
