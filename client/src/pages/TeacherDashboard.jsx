import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
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
    return <LoadingSpinner size="lg" text="Loading faculty metrics..." />;
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
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-900 dark:from-[#131C2E] dark:via-[#162736] dark:to-[#0D1524] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-teal-200/20 dark:border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient top right glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 dark:bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-teal-500/20 text-white dark:text-teal-200 border border-white/20 dark:border-teal-500/30 shadow-xs">
            Faculty Instructor Portal &amp; Academic Cohorts
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome, {data?.teacherName}!
          </h1>
          <p className="text-teal-100 dark:text-slate-300 text-sm max-w-xl leading-relaxed">
            Monitor class performance, assign formative assessments, inspect curriculum bottlenecks, and review AI-generated questions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <Link to="/teacher/quizzes/ai-generate">
            <Button variant="primary" size="sm" icon={Sparkles}>
              AI Quiz Generator
            </Button>
          </Link>
          <Link to="/teacher/at-risk">
            <Button variant="teal" size="sm" icon={ShieldAlert}>
              At-Risk Student Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Students"
          value={data?.totalStudentsCount || 0}
          subtitle="Enrolled in active cohorts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Managed Classes"
          value={data?.classesCount || 0}
          subtitle="Assigned teaching sections"
          icon={Layers}
          color="teal"
        />
        <StatCard
          title="Question Bank"
          value={data?.questionsInBankCount || 0}
          subtitle="Questions ready for quizzes"
          icon={HelpCircle}
          color="indigo"
        />
        <StatCard
          title="Class Average"
          value={`${data?.classAverageScore || 0}%`}
          subtitle="Across recent evaluations"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/teacher/questions" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#23324D] hover:border-blue-500 dark:hover:border-blue-400 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Question Bank</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Author &amp; weight questions</p>
          </div>
        </Link>

        <Link to="/teacher/quizzes" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#23324D] hover:border-teal-500 dark:hover:border-teal-400 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quizzes &amp; Tests</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Publish &amp; assign evaluations</p>
          </div>
        </Link>

        <Link to="/teacher/import" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#23324D] hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">CSV Data Import</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Bulk upload marks &amp; attendance</p>
          </div>
        </Link>

        <Link to="/teacher/at-risk" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#23324D] hover:border-rose-500 dark:hover:border-rose-400 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">At-Risk Early Warning</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Machine learning intervention</p>
          </div>
        </Link>
      </div>

      {/* Classes & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Managed Cohorts */}
        <Card>
          <CardHeader
            title="Assigned Cohorts &amp; Classes"
            subtitle="Sections linked to your faculty account"
            action={
              <Link to="/teacher/analytics">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Full Analytics &rarr;
                </span>
              </Link>
            }
          />

          <div className="space-y-3">
            {data?.managedClasses?.length > 0 ? (
              data.managedClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-[#23324D] bg-slate-50 dark:bg-[#0D1424] flex items-center justify-between hover:bg-slate-100/80 dark:hover:bg-[#162136] transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cls.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{cls.studentCount} enrolled students</p>
                  </div>
                  <Link to="/teacher/analytics">
                    <Button variant="secondary" size="sm">
                      Inspect Cohort
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No assigned classes found.</p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title="Recent Student Activity"
            subtitle="Live student assessment telemetry"
          />

          <div className="space-y-3">
            {data?.recentActivities?.length > 0 ? (
              data.recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-[#23324D] bg-slate-50 dark:bg-[#0D1424] flex items-start gap-3"
                >
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{act.title}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{act.description}</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">{act.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No student activity logged in the past 24 hours.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
