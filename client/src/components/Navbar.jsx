import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Shield, UserCheck, Sparkles, User, Settings, Code2, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DemoWalkthroughModal } from './DemoWalkthroughModal';
import { ThemeToggle } from './ui/ThemeToggle';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
            <Shield className="w-3 h-3 text-rose-500" /> Admin
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs">
            <UserCheck className="w-3 h-3 text-teal-500" /> Faculty
          </span>
        );
      case 'STUDENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <GraduationCap className="w-3 h-3 text-indigo-500" /> Student
          </span>
        );
    }
  };

  return (
    <header className="bg-white/80 dark:bg-[#080B11]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/70 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 font-black text-lg group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-200">
                E
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent tracking-tight">
                    EduPulse
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    Pro
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-none">
                  Adaptive Learning &amp; Analytics
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (Light / Dark / System) */}
            <ThemeToggle />

            {/* Demo Walkthrough Button */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 hover:from-indigo-500/20 hover:to-sky-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
              title="Launch viva presentation guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="hidden sm:inline">Demo Walkthrough</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all focus:outline-none cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      {roleBadge(user.role)}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 via-violet-500/15 to-transparent text-indigo-600 dark:text-indigo-300 font-extrabold text-sm border border-indigo-500/30 shadow-xs flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Profile &amp; Credentials</span>
                      </Link>

                      {user.role === 'STUDENT' && (
                        <Link
                          to="/student/connected-accounts"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Code2 className="w-4 h-4 text-violet-500" />
                          <span>Connected Portfolios</span>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Platform Settings</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
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
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
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
