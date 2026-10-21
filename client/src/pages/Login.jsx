import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Alert } from '../components/Alert';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role')?.toUpperCase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If role parameter is present, set sensible default demo email
    if (requestedRole === 'TEACHER') {
      setEmail('teacher.sarah@edupulse.local');
    } else if (requestedRole === 'ADMIN') {
      setEmail('admin@edupulse.local');
    } else if (requestedRole === 'STUDENT') {
      setEmail('student1@edupulse.local');
    }
  }, [requestedRole]);

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
        badgeColor: 'bg-teal-50 dark:bg-teal-950/60 text-academic-teal border-teal-200 dark:border-teal-800',
        icon: UserCheck,
        iconBg: 'bg-academic-teal text-white',
        title: 'Faculty & Instructor Sign In',
        subtitle: 'Class curriculum, analytics, and early warning interventions'
      };
    }
    if (requestedRole === 'ADMIN') {
      return {
        badge: 'Administration',
        badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 border-rose-200 dark:border-rose-800',
        icon: ShieldCheck,
        iconBg: 'bg-rose-600 text-white',
        title: 'Institutional Administrator Sign In',
        subtitle: 'Campus cohorts, global settings, and audit logs'
      };
    }
    return {
      badge: 'Learner Portal',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-academic-blue border-blue-200 dark:border-blue-800',
      icon: GraduationCap,
      iconBg: 'bg-academic-blue text-white',
      title: 'Sign in to EduPulse',
      subtitle: 'Adaptive learning paths, BKT mastery, and AI tutor'
    };
  };

  const portal = getPortalInfo();
  const PortalIcon = portal.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-academic-darkBg transition-colors">
      <div className="max-w-md w-full space-y-6">
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

        <div className="bg-white dark:bg-academic-darkCard p-8 rounded-3xl border border-slate-200 dark:border-academic-darkBorder shadow-sm space-y-6">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-academic-blue focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-academic-blue focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-academic-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-academic-blue shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1-Click Demo Accounts
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student1@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex flex-col items-center gap-1 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-academic-blue" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('teacher.sarah@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-semibold rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors flex flex-col items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-academic-teal" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('admin@edupulse.local', 'Password@123')}
              className="p-2.5 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex flex-col items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            New student?{' '}
            <Link to="/register" className="font-semibold text-academic-blue hover:underline">
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
