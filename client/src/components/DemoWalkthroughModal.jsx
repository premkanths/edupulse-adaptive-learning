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
      description: 'EduPulse is an AI-powered adaptive learning platform integrating Attentive Knowledge Tracing (AKT), generative AI, and Random Forest machine learning to optimize student learning paths and early at-risk detection.',
      keyPoints: [
        'React 18 + Vite + Tailwind CSS frontend with Recharts analytics',
        'Java 23 + Spring Boot 3 backend with stateless JWT & BCrypt security',
        'Attentive Knowledge Tracing (AKT, Ghosh et al. KDD 2020) with temporal decay attention',
        'Python FastAPI service running a 94.6% accurate Random Forest model and PyTorch AKT'
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
      title: 'Step 4: Student Adaptive Quizzes & Attentive Knowledge Tracing (AKT)',
      badge: 'Student Feature',
      icon: Award,
      description: 'Students take formative assessments while the deep Attentive Knowledge Tracing (AKT) model evaluates concept mastery sequences in real time, with automatic BKT fallback.',
      keyPoints: [
        'Context-aware self-attention with monotonic temporal decay over interaction sequences',
        'Continuous probability estimation with explainable top-attended question weighting',
        'Seamless automatic fallback to Corbett & Anderson Bayesian Knowledge Tracing (BKT) baseline'
      ],
      actionLabel: 'Open Student Quizzes',
      actionRoute: '/student/quizzes'
    },
    {
      title: 'Step 5: Personalized Socratic AI Study Assistant',
      badge: 'Student Feature',
      icon: Brain,
      description: 'A context-aware tutor that injects the student’s actual weak topics and recent quiz mistakes into LLM prompts for personalized guidance.',
      keyPoints: [
        'Multi-session persistent chat stored in MySQL database',
        'Automatic topic-aware chat session titling',
        'Contextual injection of student mastery telemetry and missed quiz questions'
      ],
      actionLabel: 'Open AI Study Assistant',
      actionRoute: '/student/assistant'
    },
    {
      title: 'Step 6: Teacher At-Risk Student Early Warning Monitor',
      badge: 'Teacher Feature',
      icon: Shield,
      description: 'An early-warning dashboard integrating a trained scikit-learn Random Forest model to flag students requiring academic intervention.',
      keyPoints: [
        'Ensemble Random Forest (94.6% Accuracy, 94.6% F1-Score) on FastAPI',
        'Risk levels: HIGH (>65%), MODERATE (35-65%), LOW (<35%)',
        'Rule-based heuristic fallback if the ML microservice is unreachable'
      ],
      actionLabel: 'Open At-Risk Monitor',
      actionRoute: '/teacher/at-risk'
    },
    {
      title: 'Step 7: Institutional Analytics & CSV Exports',
      badge: 'Admin Feature',
      icon: BookOpen,
      description: 'High-level administration metrics with instant streaming CSV exports for accreditation, research, and institutional reporting.',
      keyPoints: [
        'Export complete student performance and roster CSV',
        'Export early intervention at-risk student list',
        'Export AKT and BKT topic mastery matrix across entire cohort'
      ],
      actionLabel: 'Open Institutional Reports',
      actionRoute: '/admin/reports'
    },
    {
      title: 'Step 8: Student AI Learning Summary & Progress Insights',
      badge: 'Student Feature',
      icon: Sparkles,
      description: 'Personalized executive intelligence summary synthesized by Gemini, analyzing recent quizzes, AKT mastery progression, and immediate next learning priorities.',
      keyPoints: [
        'Direct executive summary and clear topic mastery standing',
        'Transparent priority identification for weak concepts needing reinforcement',
        'Integrated 1-click quiz practice and focused study guidance'
      ],
      actionLabel: 'Open Student AI Summary',
      actionRoute: '/student/ai-summary'
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleAction = () => {
    onClose();
    navigate(step.actionRoute);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{step.badge}</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{step.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            {step.description}
          </p>

          <div className="bg-gray-50 dark:bg-gray-950/70 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Key Technical Highlights:</p>
            <ul className="space-y-1.5">
              {step.keyPoints.map((point, idx) => (
                <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAction}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {step.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
