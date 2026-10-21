import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, Layers, GitBranch, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await studentApi.getSubjects();
        if (res.success) {
          setSubjects(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load curriculum subjects.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading subjects and BKT mastery..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const getMasteryColor = (p) => {
    if (p >= 0.80) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Strong Mastery' };
    if (p >= 0.50) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Developing' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', label: 'Weak (Action Needed)' };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enrolled Subjects & Topic Mastery</h1>
        <p className="text-sm text-slate-500 mt-1">
          Each topic is dynamically tracked using Bayesian Knowledge Tracing (BKT) to estimate your true probability of mastery (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-xs">pKnown</code>).
        </p>
      </div>

      <div className="space-y-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{subject.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{subject.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.topics?.map((topic) => {
                const p = topic.pKnown || 0.30;
                const percent = Math.round(p * 100);
                const color = getMasteryColor(p);

                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{topic.name}</h3>
                        {topic.prerequisiteName && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                            <GitBranch className="w-3 h-3 text-slate-400" />
                            <span>Prerequisite: <strong>{topic.prerequisiteName}</strong></span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                        {color.label}
                      </span>
                    </div>

                    {/* BKT Mastery Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>pKnown Mastery</span>
                        <span className="font-mono">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color.bar} transition-all duration-500 rounded-full`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-500">
                      <span>Historical Accuracy: <strong>{topic.accuracy}%</strong> ({topic.attemptsCount} attempts)</span>
                      <Link
                        to="/student/quizzes"
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Practice <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
