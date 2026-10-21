import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingChatWidget } from './components/FloatingChatWidget';

// Phase 4 Landing Page
import { LandingPage } from './pages/LandingPage';

// Phase 1 Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

// Phase 2 to 5 Pages
import { StudentSubjects } from './pages/StudentSubjects';
import { StudentQuizzes } from './pages/StudentQuizzes';
import { QuizTaking } from './pages/QuizTaking';
import { QuizResult } from './pages/QuizResult';
import { Recommendations } from './pages/Recommendations';
import { PerformanceHistory } from './pages/PerformanceHistory';
import { AiStudyAssistant } from './pages/AiStudyAssistant';

import { QuestionBank } from './pages/QuestionBank';
import { TeacherQuizzes } from './pages/TeacherQuizzes';
import { AiQuizGenerator } from './pages/AiQuizGenerator';
import { ClassAnalytics } from './pages/ClassAnalytics';

// Phases 6 to 10 Pages
import { AcademicImport } from './pages/AcademicImport';
import { CourseMaterials } from './pages/CourseMaterials';
import { AtRiskStudents } from './pages/AtRiskStudents';
import { ResearchEvaluation } from './pages/ResearchEvaluation';
import { StudentProfilePrivacy } from './pages/StudentProfilePrivacy';
import { ConnectedAccounts } from './pages/ConnectedAccounts';
import { UserProfile } from './pages/UserProfile';

// Phases 11 to 15 Pages
import { ClassManagement } from './pages/ClassManagement';
import { PlatformSettings } from './pages/PlatformSettings';
import { AdminReports } from './pages/AdminReports';
import { AuditLogViewer } from './pages/AuditLogViewer';

const RootRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <LandingPage />;

  switch (user?.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'TEACHER':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'STUDENT':
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <FloatingChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry Point */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />
            <Route path="/unauthorized" element={<><Navbar /><Unauthorized /></>} />

            {/* Common Authenticated Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                  <Layout><UserProfile /></Layout>
                </ProtectedRoute>
              }
            />

            {/* === Student Routes === */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><StudentDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/subjects"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><StudentSubjects /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quizzes"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><StudentQuizzes /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quizzes/:quizId/take"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><QuizTaking /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quizzes/:quizId/result"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><QuizResult /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/recommendations"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><Recommendations /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/performance"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><PerformanceHistory /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assistant"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><AiStudyAssistant /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/connected-accounts"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><ConnectedAccounts /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout><StudentProfilePrivacy /></Layout>
                </ProtectedRoute>
              }
            />

            {/* === Teacher Routes === */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><TeacherDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/questions"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><QuestionBank /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/quizzes"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><TeacherQuizzes /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/quizzes/ai-generate"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><AiQuizGenerator /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/materials"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <Layout><CourseMaterials /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/analytics"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><ClassAnalytics /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/at-risk"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Layout><AtRiskStudents /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/import"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <Layout><AcademicImport /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/research"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <Layout><ResearchEvaluation /></Layout>
                </ProtectedRoute>
              }
            />

            {/* === Admin Routes === */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><ClassManagement /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><ClassManagement /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/import"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><AcademicImport /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/research"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><ResearchEvaluation /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><PlatformSettings /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><AdminReports /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><AuditLogViewer /></Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 Catch All */}
            <Route path="*" element={<><Navbar /><NotFound /></>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
