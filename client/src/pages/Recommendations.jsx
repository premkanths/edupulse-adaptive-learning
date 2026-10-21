import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Lightbulb, Info, ArrowRight, BookOpen, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWhyThis, setSelectedWhyThis] = useState(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await studentApi.getRecommendations();
        if (res.success) {
          setRecs(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Evaluating Bayesian mastery &amp; prerequisites..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const typeConfig = {
    PRACTICE_WEAK_TOPIC: {
      badge: 'Weak Topic Remediation',
      badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: AlertTriangle,
      actionText: 'Practice 5 Diagnostic Questions',
    },
    REVIEW_PREREQUISITE: {
      badge: 'Prerequisite Required',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Info,
      actionText: 'Review Prerequisite Theory',
    },
    CHALLENGE_TOPIC: {
      badge: 'High Mastery Challenge',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      actionText: 'Attempt Advanced Problem Set',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Personalized Adaptive Recommendations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          EduPulse’s Bayesian Knowledge Tracing engine calculates dynamic recommendations with full algorithmic explainability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recs.map((rec) => {
          const cfg = typeConfig[rec.recommendationType] || typeConfig.PRACTICE_WEAK_TOPIC;
          const Icon = cfg.icon;

          return (
            <div
              key={rec.id}
              className="bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.badgeColor} flex items-center gap-1.5 shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" /> {cfg.badge}
                  </span>
                  <button
                    onClick={() => setSelectedWhyThis(rec)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3 py-1 rounded-xl transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" /> Why this?
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{rec.topic?.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {rec.explanation}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#080B11]/70 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200 block mb-1">Empirical Evidence:</strong>
                  {rec.supportingEvidence}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                <Link
                  to="/student/quizzes"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer"
                >
                  {cfg.actionText} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Why This?" Explanation Modal */}
      {selectedWhyThis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl rounded-3xl p-6 md:p-7 max-w-lg w-full border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Explainable Recommendation</h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Audited from live Bayesian telemetry</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWhyThis(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#080B11]/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Topic</span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{selectedWhyThis.topic?.name}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Algorithmic Reason</span>
                <p className="mt-0.5 leading-relaxed">{selectedWhyThis.explanation}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Supporting Telemetry Evidence</span>
                <p className="mt-1 font-mono text-[11px] bg-white dark:bg-[#0F1626] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed text-indigo-900 dark:text-indigo-300">
                  {selectedWhyThis.supportingEvidence}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Research Contribution</span>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400 italic">
                  Unlike black-box recommenders, EduPulse couples Bayesian Knowledge Tracing with prerequisite DAG constraints to justify each pedagogical suggestion.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedWhyThis(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
