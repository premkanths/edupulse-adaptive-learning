import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { BookOpen, Award, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentApi.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load student dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading student analytics from MySQL..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert type="error" title="Dashboard Error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Bayesian Knowledge Tracing Active
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {data?.studentName}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm max-w-xl">
            EduPulse monitors your response patterns and calculates topic-level probability of mastery (pKnown) in real-time.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Topic Mastery"
          value={`${Math.round((data?.overallMasteryAverage || 0) * 100)}%`}
          subtitle="Bayesian Knowledge Tracing (pKnown)"
          icon={Award}
          color="indigo"
          trend="+4.2% this week"
        />
        <StatCard
          title="Enrolled Subjects"
          value={data?.enrolledSubjectsCount || 0}
          subtitle="Active academic courses"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Strong Topics"
          value={data?.strongTopicsCount || 0}
          subtitle="pKnown ≥ 0.80 threshold"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Weak Topics"
          value={data?.weakTopicsCount || 0}
          subtitle="pKnown < 0.50 (Action needed)"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Recommendations & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adaptive Recommendations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Personalized Recommendations</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Adaptive Engine
            </span>
          </div>

          <div className="space-y-3">
            {data?.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-slate-800">{rec.topic}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <strong>Why this?</strong> {rec.reason}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-indigo-600 font-semibold">{rec.action}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1">
                    Start Practice <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Recent Quizzes & Attempts</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Completed
            </span>
          </div>

          <div className="space-y-3">
            {data?.recentQuizzes?.map((quiz, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Attempted on {quiz.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-600">{quiz.score}%</div>
                  <span className="text-xs font-medium text-slate-500">{quiz.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
