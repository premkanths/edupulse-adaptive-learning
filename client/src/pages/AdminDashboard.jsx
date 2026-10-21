import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Users, GraduationCap, UserCheck, ShieldCheck, Layers, BookOpen, Shield } from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load admin metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading platform administration data from MySQL..." />;
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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <UserCheck className="w-3 h-3" /> Teacher
          </span>
        );
      case 'STUDENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Platform Superadmin Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            EduPulse System Administration
          </h1>
          <p className="mt-2 text-slate-300 text-sm max-w-xl">
            Manage users, oversee academic imports, review system health, and enforce institutional data boundaries.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={data?.totalUsersCount || 0}
          subtitle="All platform accounts"
          icon={Users}
          color="indigo"
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
          color="blue"
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
          color="purple"
        />
        <StatCard
          title="Subjects"
          value={data?.subjectsCount || 0}
          subtitle="Curriculum courses"
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform User Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing seeded and registered accounts from MySQL</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {data?.recentUsers?.length || 0} Records Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data?.recentUsers?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {u.name?.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial Seed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
