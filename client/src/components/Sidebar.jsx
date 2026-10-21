import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Lightbulb,
  Users,
  Settings,
  UploadCloud,
  Layers,
  Sparkles,
  Bot,
  GraduationCap,
  ShieldAlert,
  Award,
  ShieldCheck,
  FileText,
  History,
  Code2,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const getLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Class Cohorts', path: '/admin/classes', icon: Layers },
          { name: 'Academic Records Import', path: '/admin/import', icon: UploadCloud },
          { name: 'Institutional Reports', path: '/admin/reports', icon: FileText },
          { name: 'Research Evaluation', path: '/admin/research', icon: Award },
          { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
          { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: History },
          { name: 'Profile & Credentials', path: '/profile', icon: User },
        ];
      case 'TEACHER':
        return [
          { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Question Bank', path: '/teacher/questions', icon: HelpCircle },
          { name: 'Quizzes & Assignments', path: '/teacher/quizzes', icon: BookOpen },
          { name: 'AI Quiz Generator', path: '/teacher/quizzes/ai-generate', icon: Sparkles },
          { name: 'Course Materials (RAG)', path: '/teacher/materials', icon: FileText },
          { name: 'Class Analytics', path: '/teacher/analytics', icon: TrendingUp },
          { name: 'At-Risk Student Monitor', path: '/teacher/at-risk', icon: ShieldAlert },
          { name: 'Academic Records Import', path: '/teacher/import', icon: UploadCloud },
          { name: 'Research Evaluation', path: '/teacher/research', icon: Award },
          { name: 'Profile & Credentials', path: '/profile', icon: User },
        ];
      case 'STUDENT':
      default:
        return [
          { name: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'My Subjects & Topics', path: '/student/subjects', icon: BookOpen },
          { name: 'Assigned Quizzes', path: '/student/quizzes', icon: HelpCircle },
          { name: 'Adaptive Recommendations', path: '/student/recommendations', icon: Lightbulb },
          { name: 'Performance Analytics', path: '/student/performance', icon: TrendingUp },
          { name: 'AI Study Assistant', path: '/student/assistant', icon: Bot },
          { name: 'Connected Portfolios', path: '/student/connected-accounts', icon: Code2 },
          { name: 'Academic Hub & Privacy', path: '/student/profile', icon: ShieldCheck },
          { name: 'Profile & Credentials', path: '/profile', icon: User },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] p-4 hidden md:block transition-colors">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            EduPulse Pro
          </span>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
          BKT adaptive mastery, ML risk prediction, research benchmarks &amp; IEEE publication suite live.
        </p>
      </div>
    </aside>
  );
};
