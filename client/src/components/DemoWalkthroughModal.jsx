import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, Play, BookOpen, Brain, Shield, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoWalkthroughModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const steps = [
    {
      title: 'EduPulse — Project Overview & Architecture',
      badge: 'Academic & Research Platform',
      icon: Brain,
      description: 'EduPulse is a full-stack academic platform integrating Bayesian Knowledge Tracing (BKT), generative AI, and Random Forest machine learning to optimize student learning paths and early at-risk detection.',
      keyPoints: [
        'React 18 + Vite + Tailwind CSS frontend with Recharts analytics',
        'Java 23 + Spring Boot 3 backend with stateless JWT & BCrypt security',
        'Corbett & Anderson Bayesian Knowledge Tracing algorithm',
        'Python FastAPI service running a 94.6% accurate Random Forest model'
      ],
      actionLabel: 'Go to Student Dashboard',
      actionRoute: '/student/dashboard'
    },
    {
      title: 'Step 1: Academic Records & Attendance CSV Import',
      badge: 'Admin Feature',
      icon: Users,
      description: 'Institutional examination marks and daily attendance records are imported using validated CSV files with row-level pre-commit preview.',
      keyPoints: [
        'Download CSV templates for Marks and Attendance',
        'Row-by-row validation checking email existence and numeric bounds',
        'Batch commitment tracking total, successful, and failed records in import_batches'
      ],
      actionLabel: 'Open Academic Import',
      actionRoute: '/admin/import'
    },
    {
      title: 'Step 2: Class Cohorts & Faculty Assignments',
      badge: 'Admin Feature',
      icon: BookOpen,
      description: 'Administrators organize students into class cohorts and assign supervising faculty for streamlined quiz distribution.',
      keyPoints: [
        'Create class cohorts (e.g. CS2025-Section A)',
        'Assign designated teacher and enroll student rosters',
        'Manage user lifecycle with 1-click active/inactive toggle'
      ],
      actionLabel: 'Open Class Cohorts',
      actionRoute: '/admin/classes'
    },
    {
      title: 'Step 3: Teacher Question Bank & AI Quiz Generator',
      badge: 'Teacher Feature',
      icon: Sparkles,
      description: 'Teachers manage 150+ curriculum questions and can generate new adaptive quizzes using a 4-tier AI fallback cascade.',
      keyPoints: [
        'Structured generation validates 4 options, 1 correct index, and explanation',
        'AI fallback: Gemini → Groq → local Ollama → deterministic Offline engine',
        'Quizzes saved as DRAFT requiring teacher approval before publishing'
      ],
      actionLabel: 'Open AI Quiz Generator',
      actionRoute: '/teacher/quizzes/ai-generate'
    },
    {
      title: 'Step 4: Student Adaptive Quiz Taking & Scoring',
      badge: 'Student Feature',
      icon: Play,
      description: 'Students take quizzes with timed countdowns, one question at a time. The server securely scores responses and hides correct answers until submission.',
      keyPoints: [
        'Anti-cheat design: correct answers never exposed in React state before submission',
        'Detailed answer explanation review with pedagogical rationale'
      ],
      actionLabel: 'View Assigned Quizzes',
      actionRoute: '/student/quizzes'
    },
    {
      title: 'Step 5: Bayesian Knowledge Tracing (BKT) Engine',
      badge: 'Adaptive Learning Algorithm',
      icon: Brain,
      description: 'After every answer, the Corbett & Anderson model updates the posterior probability of concept mastery P(L_n).',
      keyPoints: [
        'Standard parameters: P(L_0)=0.30, P(T)=0.20, P(G)=0.20, P(S)=0.10',
        'Real-time topic mastery tracking across subjects',
        'Remediation alert triggered when topic mastery drops below 60%'
      ],
      actionLabel: 'View Topic Mastery Bars',
      actionRoute: '/student/subjects'
    },
    {
      title: 'Step 6: Explainable Recommendations ("Why this?")',
      badge: 'Student Feature',
      icon: Award,
      description: 'Students receive evidence-based study recommendations explaining exactly why a topic was suggested.',
      keyPoints: [
        'Recommends weak topics, prerequisite reviews, or advanced challenges',
        'Transparent "Why this?" panel detailing score evidence and rationale'
      ],
      actionLabel: 'View Recommendations',
      actionRoute: '/student/recommendations'
    },
    {
      title: 'Step 7: Context-Aware AI Study Assistant',
      badge: 'AI Integration',
      icon: Sparkles,
      description: 'An AI study assistant that tailors responses using the authenticated student\'s actual weak topics and mastery scores.',
      keyPoints: [
        'Personalized prompt injection with strict student privacy isolation',
        'Persistent markdown chat sessions and delete history capabilities'
      ],
      actionLabel: 'Open AI Study Assistant',
      actionRoute: '/student/assistant'
    },
    {
      title: 'Step 8: Machine Learning At-Risk Model & Alerts',
      badge: 'ML Prediction',
      icon: Shield,
      description: 'A Python FastAPI Random Forest model continuously evaluates student risk features, recommending tailored teacher interventions.',
      keyPoints: [
        'Evaluates quiz avg, attendance %, BKT mastery, inactivity days, and missed marks',
        '94.58% accuracy with automatic heuristic rule-based fallback if ML is offline'
      ],
      actionLabel: 'Open At-Risk Monitor',
      actionRoute: '/teacher/at-risk'
    },
    {
      title: 'Step 9: Research Benchmarks, Privacy & Reports',
      badge: 'Research Evaluation',
      icon: Award,
      description: 'Empirical research comparisons suitable for academic publication and complete GDPR/FERPA privacy rights.',
      keyPoints: [
        'Adaptive BKT reaches 85% mastery in 5.8 attempts vs 11.2 on fixed paths (48.2% time reduction)',
        'BKT achieves 0.842 ROC-AUC vs 0.714 on moving average baseline (+17.9% gain)',
        'Right to be Forgotten permanently anonymizes user and purges private chat logs',
        '1-click CSV exports of students, at-risk rosters, and topic mastery'
      ],
      actionLabel: 'Open Research Evaluation Suite',
      actionRoute: '/admin/research'
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleAction = () => {
    navigate(step.actionRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{step.badge}</span>
              <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {step.description}
          </p>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Key Technical Highlights:</p>
            <ul className="space-y-1.5">
              {step.keyPoints.map((point, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAction}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              {step.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
