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
          { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
          { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: History },
        ];
      case 'TEACHER':
        return [
          { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Evaluated Exam Papers', path: '/teacher/exam-papers', icon: Award },
          { name: 'Question Bank', path: '/teacher/questions', icon: HelpCircle },
          { name: 'Quizzes & Assignments', path: '/teacher/quizzes', icon: BookOpen },
          { name: 'AI Quiz Generator', path: '/teacher/quizzes/ai-generate', icon: Sparkles },
          { name: 'Course Materials (RAG)', path: '/teacher/materials', icon: FileText },
          { name: 'Class Analytics', path: '/teacher/analytics', icon: TrendingUp },
          { name: 'At-Risk Student Monitor', path: '/teacher/at-risk', icon: ShieldAlert },
          { name: 'Upload Marks & Attendance', path: '/teacher/import', icon: UploadCloud },
        ];
      case 'STUDENT':
      default:
        return [
          { name: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'AI Student Summary', path: '/student/ai-summary', icon: Sparkles },
          { name: 'My Subjects', path: '/student/subjects', icon: BookOpen },
          { name: 'Result Marks', path: '/student/results', icon: GraduationCap },
          { name: 'Course Materials', path: '/student/materials', icon: FileText },
          { name: 'Assigned Quizzes', path: '/student/quizzes', icon: HelpCircle },
          { name: 'Adaptive Recommendations', path: '/student/recommendations', icon: Lightbulb },
          { name: 'Performance Analytics', path: '/student/performance', icon: TrendingUp },
          { name: 'AI Study Assistant', path: '/student/assistant', icon: Bot },
          { name: 'Connected Portfolios', path: '/student/connected-accounts', icon: Code2 },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-16 h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between transition-colors z-20 shrink-0">
      <div className="space-y-1 overflow-y-auto pr-1 flex-1 no-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Pinned Bottom Identity & Profile Access */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800 shrink-0 mt-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2.5 rounded-2xl transition-all border ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                : 'bg-gray-50 dark:bg-gray-800/80 hover:bg-indigo-50 dark:hover:bg-gray-800 border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`
          }
          title="Profile & Credentials"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            E
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xs font-black text-gray-900 dark:text-gray-50 tracking-tight">
                EduPulse
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {role === 'TEACHER' ? 'Faculty' : role === 'ADMIN' ? 'Admin' : 'Student'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
              Profile &amp; Credentials
            </p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
