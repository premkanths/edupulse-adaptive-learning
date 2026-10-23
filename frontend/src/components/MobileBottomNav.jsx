import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  HelpCircle,
  Bot,
  GraduationCap,
  Menu,
  BookOpen,
  Award,
  ShieldAlert,
  Users,
  Layers,
  FileText
} from 'lucide-react';

export const MobileBottomNav = ({ onOpenMenu }) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Don't show bottom nav inside active full-screen quiz taking
  if (location.pathname.startsWith('/student/quiz/')) return null;

  const getBottomLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Classes', path: '/admin/classes', icon: Layers },
          { name: 'Reports', path: '/admin/reports', icon: FileText },
        ];
      case 'TEACHER':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Exams', path: '/teacher/exam-papers', icon: Award },
          { name: 'Quizzes', path: '/teacher/quizzes', icon: BookOpen },
          { name: 'At-Risk', path: '/teacher/at-risk', icon: ShieldAlert },
        ];
      case 'STUDENT':
      default:
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Quizzes', path: '/student/quizzes', icon: HelpCircle },
          { name: 'Jarvis AI', path: '/student/assistant', icon: Bot, isAi: true },
          { name: 'Marks', path: '/student/results', icon: GraduationCap },
        ];
    }
  };

  const links = getBottomLinks();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex justify-around items-center transition-colors"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;

        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? link.isAi
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${link.isAi && isActive ? 'animate-pulse' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {link.name}
            </span>
          </NavLink>
        );
      })}

      {/* "More / Menu" Toggle Trigger for Slide-out Drawer */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-all"
        title="Open full menu"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
      </button>
    </nav>
  );
};
