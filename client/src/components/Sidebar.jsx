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
  FileCheck2,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const getLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Academic Records Import', path: '/admin/import', icon: UploadCloud },
          { name: 'Research Evaluation', path: '/admin/research', icon: Award },
          { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'TEACHER':
        return [
          { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Question Bank', path: '/teacher/questions', icon: HelpCircle },
          { name: 'Quizzes & Assignments', path: '/teacher/quizzes', icon: BookOpen },
          { name: 'AI Quiz Generator', path: '/teacher/quizzes/ai-generate', icon: Sparkles },
          { name: 'Class Analytics', path: '/teacher/analytics', icon: TrendingUp },
          { name: 'At-Risk Student Monitor', path: '/teacher/at-risk', icon: ShieldAlert },
          { name: 'Academic Records Import', path: '/teacher/import', icon: UploadCloud },
          { name: 'Research Evaluation', path: '/teacher/research', icon: Award },
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
          { name: 'Academic Hub & Privacy', path: '/student/profile', icon: ShieldCheck },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Phases 1-10 Live
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          BKT adaptive mastery, ML at-risk prediction, CSV imports, weekly summaries, external portfolios & research benchmarks active.
        </p>
      </div>
    </aside>
  );
};
