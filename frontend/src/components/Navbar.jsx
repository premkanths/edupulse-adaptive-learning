import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Shield, UserCheck, Sparkles, User, Settings, Code2, ChevronDown, ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { DemoWalkthroughModal } from './DemoWalkthroughModal';
import { ThemeToggle } from './ui/ThemeToggle';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = location.pathname !== '/' && location.pathname !== '/home';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
            <Shield className="w-3 h-3 text-rose-500" /> Admin
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs">
            <UserCheck className="w-3 h-3 text-teal-500" /> Faculty
          </span>
        );
      case 'STUDENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <GraduationCap className="w-3 h-3 text-indigo-500" /> Student
          </span>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xs sticky top-0 z-40 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand + Back Button "<" */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs font-black text-lg group-hover:scale-105 transition-all duration-200">
                E
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                    EduPulse
                  </span>
                </div>
                <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                  Adaptive Learning &amp; Student Analytics
                </span>
              </div>
            </Link>

            {/* Back Button "<" */}
            {canGoBack && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs cursor-pointer ml-1"
                title="Go back to previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Direct Theme Toggle */}
            <ThemeToggle />

            {/* Student AI Summary Trigger (Student Only) - Navigates to Full Page */}
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => navigate('/student/ai-summary')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  location.pathname === '/student/ai-summary'
                    ? 'bg-purple-600 text-white shadow-purple-500/25 ring-2 ring-purple-400'
                    : 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/60 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/60 dark:hover:to-indigo-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
                title="Open Full Student AI Summary Page"
              >
                <Sparkles className={`w-3.5 h-3.5 ${location.pathname === '/student/ai-summary' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                <span className="hidden sm:inline">AI Summary</span>
              </button>
            )}

            {/* Demo Walkthrough Button */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-gray-800 hover:bg-indigo-100/80 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Launch viva presentation guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Demo Walkthrough</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {user.name}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      {roleBadge(user.role)}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm border border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl py-2 z-50 animate-scale-up origin-top-right"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Profile &amp; Credentials</span>
                      </Link>

                      {user.role === 'STUDENT' && (
                        <Link
                          to="/student/connected-accounts"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Code2 className="w-4 h-4 text-violet-500" />
                          <span>Connected Portfolios</span>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Platform Settings</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-xs transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Walkthrough Modal */}
      <DemoWalkthroughModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </header>
  );
};
