import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, Brain, TrendingUp, Sparkles, ArrowRight, CheckCircle, Award, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handlePortalSelect = (role) => {
    if (isAuthenticated) {
      if (user?.role === 'STUDENT') navigate('/student/dashboard');
      else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
    } else {
      navigate(`/login?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors relative overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-gray-900 dark:text-gray-50 tracking-tight">
                  EduPulse
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Pro
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={() => handlePortalSelect(user?.role)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Portals */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 w-full space-y-14 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>EduPulse 2.0 &bull; Psychometric AI &amp; Adaptive Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight sm:leading-tight md:leading-tight text-gray-900 dark:text-gray-50">
            Personalized Academic Mastery Grounded in{' '}
            <span className="text-indigo-600 dark:text-indigo-400">
              Psychometric Science
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            EduPulse combines Bayesian Knowledge Tracing (BKT) with multi-model machine learning and local Socratic AI to deliver dynamic practice paths and timely early-warning intervention.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> 94.6% ML Risk Accuracy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Brain className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Bayesian Knowledge Tracing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs">
              <Award className="w-3 h-3 text-purple-600 dark:text-purple-400" /> IEEE 2026 Camera-Ready Suite
            </span>
          </div>
        </div>

        {/* Two Clear Role Options (Student vs Faculty) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Option 1: Student Portal */}
          <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Learner Gateway
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-1 tracking-tight">
                  Student Portal
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  Diagnose weak knowledge components, practice adaptive prerequisite-aware questions, and study with your personalized AI Socratic assistant.
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Real-time BKT Topic Mastery Heatmaps</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Prerequisite-aware question recommendations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>GitHub, LeetCode &amp; HackerRank portfolio linking</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handlePortalSelect('STUDENT')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Access Student Portal <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                New student?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>

          {/* Option 2: Teacher / Faculty Portal */}
          <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Instructor Gateway
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-1 tracking-tight">
                  Teacher / Faculty Portal
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  Monitor cohort conceptual mastery matrices, identify at-risk students before examinations, and author adaptive quizzes with AI drafting.
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span>Ensemble ML At-Risk Early Warning System</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span>Bulk CSV marks &amp; attendance import validation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span>AI question authoring with 4-option validation</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handlePortalSelect('TEACHER')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Access Faculty Portal <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                Faculty accounts are assigned by institutional administration
              </p>
            </div>
          </div>
        </div>

        {/* Platform Technical Architecture Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Brain className="w-5 h-5" /> Bayesian Knowledge Tracing
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              Calculates latent learning transitions with Corbett &amp; Anderson priors (P(L0)=0.30, P(T)=0.20, P(G)=0.20, P(S)=0.10).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <TrendingUp className="w-5 h-5" /> Multi-Model ML Classification
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              Random Forest &amp; Gradient Boosting classifiers delivering ROC-AUC &gt; 0.98 for student dropout risk prediction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" /> Socratic AI Orchestrator
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              Cascades through Gemini, Groq (Llama-3), local Ollama, and rule-based template engine for resilient zero-cost inference.
            </p>
          </div>
        </div>

        {/* Restricted Admin Access Link */}
        <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-800 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Campus Administrator?</span>
            <button
              onClick={() => handlePortalSelect('ADMIN')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Access Institutional Administration
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400 relative z-10">
        <p>EduPulse Academic &amp; Research Platform &bull; Built with Spring Boot 3, React 18, MySQL &amp; Scikit-Learn</p>
      </footer>
    </div>
  );
};
