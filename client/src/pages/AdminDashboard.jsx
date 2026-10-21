import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Users,
  Layers,
  FileText,
  History,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Settings,
  Brain,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrator metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading institutional metrics..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert type="error" title="Dashboard Error" message={error} />
      </div>
    );
  }

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="danger" size="sm">Admin</Badge>;
      case 'TEACHER':
        return <Badge variant="teal" size="sm">Teacher</Badge>;
      case 'STUDENT':
      default:
        return <Badge variant="info" size="sm">Student</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 via-rose-700 to-indigo-900 dark:from-gray-900 dark:via-gray-900 dark:to-rose-950/70 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-rose-200/20 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient top right glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-rose-500/20 text-white dark:text-rose-200 border border-white/20 dark:border-rose-400/30 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-300 animate-pulse" /> Platform Superadmin Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            EduPulse System Administration
          </h1>
          <p className="text-rose-100 dark:text-gray-300 text-sm max-w-xl leading-relaxed">
            Manage users, class cohorts, oversee institutional CSV exports, audit security trails, and configure global Knowledge Tracing (AKT &amp; BKT fallback) hyperparameters.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <Link to="/admin/reports">
            <Button variant="primary" size="sm" icon={FileText}>
              Institutional Reports
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="secondary" size="sm" icon={Settings}>
              Platform Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={data?.totalUsersCount || 0}
          subtitle="All platform accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Students"
          value={data?.studentsCount || 0}
          subtitle="Enrolled learners"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Instructors"
          value={data?.teachersCount || 0}
          subtitle="Faculty members"
          icon={UserCheck}
          color="teal"
        />
        <StatCard
          title="Administrators"
          value={data?.adminsCount || 0}
          subtitle="System operators"
          icon={ShieldCheck}
          color="rose"
        />
        <StatCard
          title="Classes"
          value={data?.classesCount || 0}
          subtitle="Academic cohorts"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Subjects"
          value={data?.subjectsCount || 0}
          subtitle="Curriculum courses"
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* Cognitive Knowledge Tracing Model Architecture & Live Telemetry */}
      {data?.knowledgeTracingModel && (
        <div className="bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-rose-200/60 dark:border-rose-900/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                    Primary Knowledge Tracing Engine: {data.knowledgeTracingModel.displayName || 'Attentive Knowledge Tracing (AKT)'}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.knowledgeTracingModel.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${data.knowledgeTracingModel.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {data.knowledgeTracingModel.status === 'ACTIVE' ? 'AKT Online (PyTorch Neural Microservice)' : 'BKT Fallback Baseline Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {data.knowledgeTracingModel.architecture || 'Context-Aware Attention with Monotonic Temporal Distance Decay'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Vocabulary: </span>
                <span className="font-mono">{data.knowledgeTracingModel.questionsIndexed || 120} Questions / {data.knowledgeTracingModel.skillsIndexed || 24} Topics</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Fallback: </span>
                <span className="font-mono">{data.knowledgeTracingModel.fallbackModel || 'BKT Baseline'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Dual-Model Architecture</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Primary predictions are inferred by the PyTorch AKT Transformer service. If the ML daemon is offline or restarting, the system immediately switches to the local Bayesian Knowledge Tracing (BKT) baseline.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Empirical Advantage</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AKT outperforms standard BKT by +29.68% on ROC-AUC (0.7625 vs 0.5880) and reduces error by -16.13% RMSE, providing significantly more reliable early learning gap identification.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Institutional Governance</span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Mastery and remediation thresholds configured in Platform Settings govern both models uniformly, maintaining full continuity in reports, transcripts, and faculty dashboards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/classes" className="block">
          <Card hover={true} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Class Cohorts &amp; Rosters</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Enroll students &amp; assign faculty</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>

        <Link to="/admin/reports" className="block">
          <Card hover={true} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Institutional CSV Exports</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">1-click audit &amp; at-risk rosters</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>

        <Link to="/admin/audit-logs" className="block">
          <Card hover={true} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">Security Audit Trail</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Immutable ledger of admin actions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Card>
        </Link>
      </div>

      {/* Recent Users Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">Platform User Directory</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Showing seeded and active platform accounts from MySQL</p>
          </div>
          <Badge variant="default">
            {data?.recentUsers?.length || 0} Accounts Loaded
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium text-gray-700 dark:text-gray-300">
              {data?.recentUsers?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center">
                      {u.name?.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-50">{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.active ? 'success' : 'danger'}>
                      {u.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial Seed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
