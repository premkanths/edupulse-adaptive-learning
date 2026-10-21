import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Lightbulb, Info, ArrowRight, BookOpen, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    return <LoadingSpinner size="lg" text="Evaluating Bayesian mastery & prerequisites..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const typeConfig = {
    PRACTICE_WEAK_TOPIC: {
      badge: 'Weak Topic Remediation',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      actionText: 'Practice 5 Diagnostic Questions',
    },
    REVIEW_PREREQUISITE: {
      badge: 'Prerequisite Required',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Info,
      actionText: 'Review Prerequisite Theory',
    },
    CHALLENGE_TOPIC: {
      badge: 'High Mastery Challenge',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      actionText: 'Attempt Advanced Problem Set',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Personalized Adaptive Recommendations</h1>
        <p className="text-sm text-slate-500 mt-1">
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
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.badgeColor} flex items-center gap-1`}>
                    <Icon className="w-3.5 h-3.5" /> {cfg.badge}
                  </span>
                  <button
                    onClick={() => setSelectedWhyThis(rec)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg"
                  >
                    <Info className="w-3.5 h-3.5" /> Why this?
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">{rec.topic?.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {rec.explanation}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600">
                  <strong className="text-slate-700 block mb-0.5">Empirical Evidence:</strong>
                  {rec.supportingEvidence}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-5">
                <Link
                  to="/student/quizzes"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Explainable Recommendation Details</h2>
                <span className="text-xs text-slate-500">Audited from live database telemetry</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Topic</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedWhyThis.topic?.name}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Algorithmic Reason</span>
                <p className="mt-0.5 leading-relaxed">{selectedWhyThis.explanation}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Supporting Telemetry Evidence</span>
                <p className="mt-0.5 font-mono text-[11px] bg-white p-2 rounded-xl border border-slate-200/60 leading-relaxed text-indigo-900">
                  {selectedWhyThis.supportingEvidence}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Research Contribution</span>
                <p className="mt-0.5 text-slate-500 italic">
                  Unlike black-box recommenders, EduPulse couples Bayesian Knowledge Tracing with prerequisite DAG constraints to justify each pedagogical suggestion.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedWhyThis(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
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
