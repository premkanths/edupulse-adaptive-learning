import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, GitBranch, ArrowRight } from 'lucide-react';
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
    if (p >= 0.80) {
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
        label: 'Strong Mastery'
      };
    }
    if (p >= 0.50) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
        label: 'Developing'
      };
    }
    return {
      bar: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
      label: 'Weak (Action Needed)'
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Enrolled Subjects &amp; Topic Mastery</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Each topic is dynamically tracked using Bayesian Knowledge Tracing (BKT) to estimate your true probability of mastery (<code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 font-mono text-xs border border-gray-200 dark:border-gray-700">pKnown</code>).
        </p>
      </div>

      <div className="space-y-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{subject.name}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subject.description}</p>
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
                    className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all space-y-3.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">{topic.name}</h3>
                        {topic.prerequisiteName && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                            <GitBranch className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>Prerequisite: <strong className="text-gray-800 dark:text-gray-200">{topic.prerequisiteName}</strong></span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${color.bg} ${color.text}`}>
                        {color.label}
                      </span>
                    </div>

                    {/* BKT Mastery Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>pKnown Mastery</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full ${color.bar} transition-all duration-500 rounded-full`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                      <span>Historical Accuracy: <strong className="text-gray-900 dark:text-gray-100">{topic.accuracy}%</strong> ({topic.attemptsCount} attempts)</span>
                      <Link
                        to="/student/quizzes"
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        Practice <ArrowRight className="w-3.5 h-3.5" />
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
