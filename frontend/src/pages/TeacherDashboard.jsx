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
  Brain,
  Cpu,
  Activity,
  Info,
  Mail,
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
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-900 dark:from-gray-900 dark:via-gray-900 dark:to-teal-950/70 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-teal-200/20 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient top right glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-teal-500/20 text-white dark:text-teal-200 border border-white/20 dark:border-teal-500/30 shadow-xs">
            Faculty Instructor Portal &amp; Academic Cohorts
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome, {data?.teacherName}!
          </h1>
          <p className="text-teal-100 dark:text-gray-300 text-sm max-w-xl leading-relaxed">
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
              At-Risk Monitor
            </Button>
          </Link>
          <Link to="/teacher/analytics">
            <Button variant="secondary" size="sm" icon={Mail}>
              Weekly Email Digests
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

      {/* Active Cognitive Knowledge Tracing Status */}
      {data?.knowledgeTracingModel && (
        <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-teal-200/60 dark:border-teal-900/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                    Active Learning-Analysis Model: {data.knowledgeTracingModel.displayName || 'Attentive Knowledge Tracing (AKT)'}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.knowledgeTracingModel.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${data.knowledgeTracingModel.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {data.knowledgeTracingModel.status === 'ACTIVE' ? 'AKT Online (PyTorch Neural Engine)' : 'BKT Fallback Baseline Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {data.knowledgeTracingModel.architecture || 'Context-Aware Attention with Monotonic Temporal Distance Decay'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Algorithmic Fallback:</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                {data.knowledgeTracingModel.fallbackModel || 'Bayesian Knowledge Tracing (BKT)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">What Predictions Represent</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Calculates the exact probability (0% to 100%) that a student has mastered each topic by observing their sequence of quiz responses over time rather than simple raw test averages.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Student Trends & Learning Gaps</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Topics below 50% mastery are flagged as learning gaps. The system guides students through prerequisite topics before testing them on complex algorithms.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">How Recommendations Are Generated</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Formative quizzes, study guides, and lecture passages are recommended dynamically by synthesizing AKT cognitive state, curriculum dependencies, and ML risk scores.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/teacher/questions" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Question Bank</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Author &amp; weight questions</p>
          </div>
        </Link>

        <Link to="/teacher/quizzes" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Quizzes &amp; Tests</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Publish &amp; assign evaluations</p>
          </div>
        </Link>

        <Link to="/teacher/import" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">CSV Data Import</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Bulk upload marks &amp; attendance</p>
          </div>
        </Link>

        <Link to="/teacher/at-risk" className="block">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">At-Risk Early Warning</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Machine learning intervention</p>
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
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
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
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">{cls.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{cls.studentCount} enrolled students</p>
                  </div>
                  <Link to="/teacher/analytics">
                    <Button variant="secondary" size="sm">
                      Inspect Cohort
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No assigned classes found.</p>
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
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 flex items-start gap-3"
                >
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{act.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{act.description}</p>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">{act.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No student activity logged in the past 24 hours.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
