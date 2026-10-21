import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { role } = useAuth();

  const getDashboardPath = () => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
      default:
        return '/student/dashboard';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-5 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Denied (403)</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your account role (<strong className="text-rose-600">{role || 'Unauthenticated'}</strong>) is not authorized to access this private endpoint. EduPulse strictly isolates student, teacher, and administrative spaces on both backend and frontend.
        </p>
        <Link
          to={getDashboardPath()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
        </Link>
      </div>
    </div>
  );
};
