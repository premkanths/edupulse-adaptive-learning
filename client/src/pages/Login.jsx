import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserCheck, ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Alert } from '../components/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read role context from query params: /login?role=STUDENT | TEACHER | ADMIN
  const searchParams = new URLSearchParams(location.search);
  const requestedRole = (searchParams.get('role') || 'STUDENT').toUpperCase();

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'TEACHER':
        navigate('/teacher/dashboard');
        break;
      case 'STUDENT':
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalInfo = () => {
    if (requestedRole === 'TEACHER') {
      return {
        badge: 'Faculty Portal',
        badgeColor: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 shadow-xs',
        icon: UserCheck,
        iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white',
        title: 'Faculty & Instructor Sign In',
        subtitle: 'Class curriculum, analytics, and early warning interventions'
      };
    }
    if (requestedRole === 'ADMIN') {
      return {
        badge: 'Administration',
        badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-xs',
        icon: ShieldCheck,
        iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
        title: 'Institutional Administrator Sign In',
        subtitle: 'Campus cohorts, global settings, and audit logs'
      };
    }
    return {
      badge: 'Learner Portal',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs',
      icon: GraduationCap,
      iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white',
      title: 'Sign in to EduPulse',
      subtitle: 'Adaptive learning paths, BKT mastery, and AI tutor'
    };
  };

  const portal = getPortalInfo();
  const PortalIcon = portal.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#080B11] transition-colors relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1 transition-all ${portal.badgeColor}`}>
            <PortalIcon className="w-3.5 h-3.5" />
            <span>{portal.badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {portal.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {portal.subtitle}
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edupulse.local"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-[#080B11]/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#080B11] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 dark:bg-[#080B11]/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#080B11] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1-Click Demo Accounts
            </span>
            <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student1@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('teacher.sarah@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-teal-500" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('admin@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            New student?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            <Link to="/" className="hover:underline">
              &larr; Back to Portal Selection
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
