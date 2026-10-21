import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { StatCard } from '../components/StatCard';
import { Award, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PerformanceHistory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const res = await studentApi.getPerformance();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load performance telemetry.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerf();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Analyzing topic mastery trends..." />;
  }

  if (error) {
    return <Alert type="error" title="Error" message={error} />;
  }

  const chartData = (data?.topicMastery || []).map((t) => ({
    name: t.topic.length > 16 ? t.topic.substring(0, 14) + '...' : t.topic,
    fullName: t.topic,
    mastery: t.mastery,
    accuracy: t.accuracy,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Analytics & Mastery Distribution</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualizing your cognitive mastery progression powered by Bayesian Knowledge Tracing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Topics Tracked"
          value={chartData.length}
          subtitle="Curriculum nodes evaluated"
          icon={BarChart3}
          color="indigo"
        />
        <StatCard
          title="Strong Topics (pKnown ≥ 0.80)"
          value={data?.strongTopicsCount || 0}
          subtitle="Concepts consolidated"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Weak Topics (pKnown < 0.50)"
          value={data?.weakTopicsCount || 0}
          subtitle="Requires additional practice"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Recharts Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Topic-Wise BKT Mastery Comparison (%)</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Live Database Metrics
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg">
                        <p className="font-bold">{d.fullName}</p>
                        <p className="text-indigo-300">pKnown Mastery: {d.mastery}%</p>
                        <p className="text-emerald-300">Historical Accuracy: {d.accuracy}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="mastery" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
