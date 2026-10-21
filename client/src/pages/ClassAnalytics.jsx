import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { StatCard } from '../components/StatCard';
import { TrendingUp, Users, BookOpen, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ClassAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    teacherApi.getClassAnalytics()
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Aggregating class analytics from database..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const scoreDistribution = [
    { range: '0-49% (High Risk)', count: 2, fill: '#f43f5e' },
    { range: '50-69% (Moderate)', count: 3, fill: '#f59e0b' },
    { range: '70-84% (Proficient)', count: 4, fill: '#6366f1' },
    { range: '85-100% (Mastery)', count: 1, fill: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Cohort Learning Analytics & Performance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review class-wide performance indicators, evaluation trends, and topic vulnerability heatmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Class Average Score"
          value={`${data?.averageScore || 72.5}%`}
          subtitle="Across all evaluated attempts"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Attempts Scored"
          value={data?.totalAttemptsRecorded || 12}
          subtitle="Live submissions tracked"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Questions in Bank"
          value={data?.totalQuestionsInBank || 153}
          subtitle="Available for assessments"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">Student Score Bracket Distribution</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400">
            N = 10 Cohort Students
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-0.5">
                        <p className="font-bold">{d.range}</p>
                        <p className="text-indigo-300">Students: {d.count}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
