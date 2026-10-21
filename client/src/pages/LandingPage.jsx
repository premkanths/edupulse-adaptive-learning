import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, Brain, TrendingUp, Sparkles, ArrowRight, BookOpen, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // If already authenticated, redirect to appropriate role dashboard
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-academic-darkBg text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-academic-darkCard/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-academic-blue flex items-center justify-center text-white font-black text-lg shadow-sm">
              E
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight">EduPulse</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-academic-blue border border-blue-200 dark:border-blue-800">
                Academic SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={() => handlePortalSelect(user?.role)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-academic-blue text-white hover:bg-blue-700 shadow-sm transition-all"
              >
                Go to My Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 w-full space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-academic-teal/10 text-academic-teal border border-academic-teal/20">
            <Award className="w-3.5 h-3.5" /> AI-Powered Adaptive Learning & Student Performance Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Personalized Academic Mastery Grounded in Psychometric Science
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            EduPulse combines Bayesian Knowledge Tracing (BKT) with multi-model machine learning and local Socratic AI to provide individualized practice and timely intervention.
          </p>
        </div>

        {/* Two Clear Role Options (Student vs Faculty) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Student Portal */}
          <div className="bg-white dark:bg-academic-darkCard border-2 border-slate-200 dark:border-slate-800 hover:border-academic-blue dark:hover:border-academic-blue rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-academic-blue flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-academic-blue uppercase tracking-wider">Learner Gateway</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">Student Portal</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Diagnose weak knowledge components, practice adaptive prerequisite-aware questions, and study with your personalized AI Socratic assistant.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Real-time BKT Topic Mastery Heatmaps</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Prerequisite-aware question recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>GitHub, LeetCode &amp; HackerRank portfolio linking</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handlePortalSelect('STUDENT')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-academic-blue hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                Access Student Portal <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                New student?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-semibold text-academic-blue hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>

          {/* Option 2: Teacher / Faculty Portal */}
          <div className="bg-white dark:bg-academic-darkCard border-2 border-slate-200 dark:border-slate-800 hover:border-academic-teal dark:hover:border-academic-teal rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-academic-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-academic-teal uppercase tracking-wider">Instructor Gateway</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">Teacher / Faculty Portal</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Monitor cohort conceptual mastery matrices, identify at-risk students before examinations, and author adaptive quizzes with AI drafting.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Ensemble ML At-Risk Early Warning System</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Bulk CSV marks &amp; attendance import validation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>AI question authoring with 4-option validation</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handlePortalSelect('TEACHER')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-academic-teal hover:bg-teal-700 text-white shadow-sm transition-all"
              >
                Access Faculty Portal <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Faculty accounts are assigned by institutional administration
              </p>
            </div>
          </div>
        </div>

        {/* Platform Technical Architecture Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-academic-darkCard border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-academic-blue font-bold text-sm">
              <Brain className="w-4 h-4" /> Bayesian Knowledge Tracing
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates latent learning transitions with Corbett &amp; Anderson priors (P(L0)=0.30, P(T)=0.20, P(G)=0.20, P(S)=0.10).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-academic-darkCard border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <TrendingUp className="w-4 h-4" /> Multi-Model ML Classification
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Random Forest &amp; Gradient Boosting classifiers delivering ROC-AUC &gt; 0.98 for student dropout risk prediction.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-academic-darkCard border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Socratic AI Orchestrator
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cascades through Gemini, Groq (Llama-3), local Ollama, and rule-based template engine for resilient zero-cost inference.
            </p>
          </div>
        </div>

        {/* Restricted Admin Access Link */}
        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Campus Administrator?</span>
            <button
              onClick={() => handlePortalSelect('ADMIN')}
              className="font-bold text-slate-700 dark:text-slate-300 hover:text-academic-blue dark:hover:text-academic-blue underline"
            >
              Access Institutional Administration
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>EduPulse Academic &amp; Research Platform &bull; Built with Spring Boot 3, React 18, MySQL &amp; Scikit-Learn</p>
      </footer>
    </div>
  );
};
