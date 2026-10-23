import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  BookOpen,
  ArrowRight,
  Flame,
  Check,
  Target,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Link } from 'react-router-dom';

export const PerformanceHistory = () => {
  const [perfData, setPerfData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, WEAK, STRONG

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, dashRes] = await Promise.all([
          studentApi.getPerformance(),
          studentApi.getDashboard()
        ]);

        if (perfRes.success) {
          setPerfData(perfRes.data);
        } else {
          setError(perfRes.message);
        }

        if (dashRes.success) {
          setDashboardData(dashRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load performance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your performance analytics..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const topicList = perfData?.topicMastery || [];
  const strongCount = perfData?.strongTopicsCount || 0;
  const weakCount = perfData?.weakTopicsCount || 0;
  const avgScore = dashboardData?.averageQuizScore ?? 85;
  const attemptsCount = dashboardData?.completedAttemptsCount ?? topicList.reduce((acc, t) => acc + (t.attempts || 0), 0);
  const overallMastery = dashboardData?.overallMasteryAverage ?? 48;

  const filteredTopics = topicList.filter((t) => {
    if (filter === 'STRONG') return t.mastery >= 75;
    if (filter === 'WEAK') return t.mastery < 50;
    return true;
  });

  const chartData = topicList.map((t) => ({
    name: t.topic.length > 14 ? t.topic.substring(0, 12) + '...' : t.topic,
    fullName: t.topic,
    mastery: t.mastery,
    accuracy: Math.round(t.accuracy || 0),
  }));

  const recentQuizzes = dashboardData?.recentQuizzes || [];
  const recentQuizPoints = recentQuizzes.map((q, idx) => ({
    name: q.title?.substring(0, 10) || `Quiz ${idx + 1}`,
    score: Math.round(q.scorePercentage || q.score || 80),
    title: q.title || 'Practice Test'
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Performance &amp; Learning Analytics
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your concept mastery, quiz accuracy trends, and see exactly which topics will boost your grades next.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Mastery</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{overallMastery}%</div>
            <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">AKT Learning Estimate</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz Accuracy</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{avgScore}%</div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Average across quizzes</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Concepts Mastered</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{strongCount}</div>
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{weakCount} needing review</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests Taken</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5">{attemptsCount}</div>
            <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Practice completed</div>
          </div>
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Mastery Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Topic Mastery Levels</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Higher bars mean stronger confidence and readiness for exams</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {topicList.length} Topics
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg">
                          <p className="font-bold">{d.fullName}</p>
                          <p className="text-indigo-300">Mastery Level: {d.mastery}%</p>
                          <p className="text-emerald-300">Historical Accuracy: {d.accuracy}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="mastery" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Quiz History or Score Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Recent Quizzes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your latest completed test results</p>
            </div>
            <Link
              to="/student/quizzes"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
              <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No recent quiz attempts found.</p>
              <Link
                to="/student/quizzes?autoStart=true"
                className="mt-3 inline-block px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold"
              >
                Take a Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQuizzes.slice(0, 4).map((q, idx) => {
                const score = Math.round(q.scorePercentage || q.score || 0);
                const isPassed = score >= 60;
                return (
                  <div
                    key={q.attemptId || idx}
                    className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-850/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {q.title || 'Diagnostic Quiz'}
                      </h4>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {q.subjectName || 'General Assessment'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black font-mono text-gray-900 dark:text-gray-50">
                        {score}%
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {isPassed ? 'Passed' : 'Needs Practice'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Topic-Wise Breakdown Table with Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Detailed Topic Breakdown</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Filter by performance to see where to invest your study time</p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'ALL' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'}`}
            >
              All ({topicList.length})
            </button>
            <button
              onClick={() => setFilter('WEAK')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'WEAK' ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Needs Focus ({weakCount})
            </button>
            <button
              onClick={() => setFilter('STRONG')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'STRONG' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Mastered ({strongCount})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
              No topics in this filter category.
            </div>
          ) : (
            filteredTopics.map((t, idx) => {
              const isStrong = t.mastery >= 75;
              const isWeak = t.mastery < 50;
              const barColor = isStrong ? 'bg-emerald-500' : isWeak ? 'bg-rose-500' : 'bg-amber-500';
              const badgeClass = isStrong
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : isWeak
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
              const statusLabel = isStrong ? 'Mastered' : isWeak ? 'Needs Practice' : 'Developing';

              return (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-850/40 transition">
                  <div className="space-y-1 sm:w-1/3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t.topic}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.subject || 'Course Subject'}</div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <span>Mastery</span>
                      <span className="font-mono text-gray-900 dark:text-gray-200">{t.mastery}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${t.mastery}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                    <div className="text-right text-gray-500 dark:text-gray-400">
                      <div><strong className="text-gray-900 dark:text-gray-100">{Math.round(t.accuracy || 0)}%</strong> accuracy</div>
                      <div className="text-[11px]">{t.attempts || 0} attempts</div>
                    </div>
                    <Link
                      to={`/student/quizzes?topic=${encodeURIComponent(t.topicName || '')}&subject=${encodeURIComponent(t.subjectName || '')}&autoStart=true`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Helpful Study Recommendations */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Want personalized recommendations tailored to your syllabus?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Check your AI Next Steps or ask Jarvis Tutor to generate targeted practice questions.
            </p>
          </div>
        </div>
        <Link
          to="/student/recommendations"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition whitespace-nowrap"
        >
          <span>View Next Steps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
