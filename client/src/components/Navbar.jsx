import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Shield, UserCheck, Sparkles, User, Settings, Code2 } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <UserCheck className="w-3 h-3" /> Faculty
          </span>
        );
      case 'STUDENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-academic-darkCard border-b border-slate-200 dark:border-academic-darkBorder sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-academic-blue flex items-center justify-center text-white shadow-sm font-black text-lg group-hover:scale-105 transition-transform">
                E
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  EduPulse
                </span>
                <span className="hidden sm:inline-block text-xs font-medium text-slate-400 dark:text-slate-500 ml-2">
                  Academic &amp; Research Platform
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-academic-blue border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Launch viva presentation guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-academic-blue" />
              <span className="hidden sm:inline">Demo Walkthrough</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      {roleBadge(user.role)}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-academic-blue/10 dark:bg-academic-blue/20 text-academic-blue font-bold text-sm border border-academic-blue/30 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-academic-darkCard border border-slate-200 dark:border-academic-darkBorder shadow-xl py-2 z-50 animate-in fade-in duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile &amp; Account Settings</span>
                      </Link>

                      {user.role === 'STUDENT' && (
                        <Link
                          to="/student/connected-accounts"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Code2 className="w-4 h-4 text-slate-400" />
                          <span>Connected Portfolios</span>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Platform Settings</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
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
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-academic-blue px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-academic-blue hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
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
