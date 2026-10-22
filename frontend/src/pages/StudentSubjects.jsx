import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, GitBranch, ArrowRight, FileText, ChevronDown, ChevronRight, Layers, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubjectIds, setExpandedSubjectIds] = useState(new Set());

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await studentApi.getSubjects();
        if (res.success) {
          setSubjects(res.data || []);
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

  const toggleSubject = (subjectId) => {
    setExpandedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSubjectIds(new Set(subjects.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSubjectIds(new Set());
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your enrolled subjects..." />;
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
      label: 'Needs Practice'
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">My Subjects</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Browse your enrolled courses. Click any subject to drop down and reveal its individual topics, prerequisites, and real-time mastery.
          </p>
        </div>

        {subjects.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Course Materials Quick Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Instructor Course Materials &amp; Lecture Notes
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Study guides, slides, and RAG document summaries provided by your professors.
            </p>
          </div>
        </div>
        <Link
          to="/student/materials"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition whitespace-nowrap cursor-pointer"
        >
          <span>Browse Course Materials</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Subjects Accordion List */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const isExpanded = expandedSubjectIds.has(subject.id);
          const topics = subject.topics || [];
          const topicCount = topics.length;

          // Average subject mastery
          const avgMastery = topicCount > 0
            ? Math.round((topics.reduce((acc, t) => acc + (t.pKnown || 0.3), 0) / topicCount) * 100)
            : 0;

          return (
            <div
              key={subject.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-800"
            >
              {/* Clickable Subject Header */}
              <div
                onClick={() => toggleSubject(subject.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none bg-gray-50/50 dark:bg-gray-850/30 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSubject(subject.id);
                  }
                }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-50 truncate">
                        {subject.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                        <Layers className="w-3 h-3" />
                        {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                      </span>
                      {topicCount > 0 && (
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          Avg Mastery: <strong className="text-gray-800 dark:text-gray-200 font-mono">{avgMastery}%</strong>
                        </span>
                      )}
                    </div>
                    {subject.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {subject.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/student/materials"
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </Link>

                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-5 h-5 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Topics Section */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fadeIn space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-2">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Topics in {subject.name} ({topicCount})
                    </span>
                    <span>Click 'Practice' to launch a targeted quiz</span>
                  </div>

                  {topicCount === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 py-3 text-center">
                      No topics added to this subject yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topics.map((topic) => {
                        const p = topic.pKnown || 0.30;
                        const percent = Math.round(p * 100);
                        const color = getMasteryColor(p);

                        return (
                          <div
                            key={topic.id}
                            className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/50 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-all space-y-3.5 shadow-xs"
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

                            {/* Topic Mastery Progress Bar */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <span>Mastery Level</span>
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{percent}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                                <div
                                  className={`h-full ${color.bar} transition-all duration-500 rounded-full`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                              <span>Accuracy: <strong className="text-gray-900 dark:text-gray-100">{topic.accuracy || 0}%</strong> ({topic.attemptsCount || 0} attempts)</span>
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
                  )}
                </div>
              )}
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Subjects Enrolled</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Contact your course instructor or administrator to enroll in curriculum subjects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
