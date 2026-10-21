import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Users, BookOpen, HelpCircle, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await teacherApi.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load teacher analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading teacher dashboard data from MySQL..." />;
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-3">
            Instructor Portal & Class Analytics
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, {data?.teacherName}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm max-w-xl">
            Monitor class performance, assign quizzes, inspect weak-topic distributions, and review AI-generated questions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Students"
          value={data?.totalStudentsCount || 0}
          subtitle="Enrolled in active cohorts"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Managed Classes"
          value={data?.classesCount || 0}
          subtitle="Assigned teaching sections"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Question Bank"
          value={data?.questionsInBankCount || 0}
          subtitle="Available for quizzes"
          icon={HelpCircle}
          color="blue"
        />
        <StatCard
          title="Class Average"
          value={`${data?.classAverageScore || 0}%`}
          subtitle="Across recent evaluations"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Classes & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Assigned Cohorts & Classes</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Live DB Records
            </span>
          </div>

          <div className="space-y-3">
            {data?.managedClasses?.map((cls, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cls.studentCount} enrolled students</p>
                </div>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  View Class
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Class Activity</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Real-time
            </span>
          </div>

          <div className="space-y-3">
            {data?.recentActivities?.map((act, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3"
              >
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{act.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
