import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy-loaded routes for 10x faster initial page load and code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentAiSummary = lazy(() => import('./pages/StudentAiSummary').then(m => ({ default: m.StudentAiSummary })));
const StudentSubjects = lazy(() => import('./pages/StudentSubjects').then(m => ({ default: m.StudentSubjects })));
const StudentMaterials = lazy(() => import('./pages/StudentMaterials').then(m => ({ default: m.StudentMaterials })));
const StudentQuizzes = lazy(() => import('./pages/StudentQuizzes').then(m => ({ default: m.StudentQuizzes })));
const QuizTaking = lazy(() => import('./pages/QuizTaking').then(m => ({ default: m.QuizTaking })));
const QuizResult = lazy(() => import('./pages/QuizResult').then(m => ({ default: m.QuizResult })));
const Recommendations = lazy(() => import('./pages/Recommendations').then(m => ({ default: m.Recommendations })));
const PerformanceHistory = lazy(() => import('./pages/PerformanceHistory').then(m => ({ default: m.PerformanceHistory })));
const AiStudyAssistant = lazy(() => import('./pages/AiStudyAssistant').then(m => ({ default: m.AiStudyAssistant })));
const StudentResultMarks = lazy(() => import('./pages/StudentResultMarks').then(m => ({ default: m.StudentResultMarks })));
const StudentProfilePrivacy = lazy(() => import('./pages/StudentProfilePrivacy').then(m => ({ default: m.StudentProfilePrivacy })));
const ConnectedAccounts = lazy(() => import('./pages/ConnectedAccounts').then(m => ({ default: m.ConnectedAccounts })));

// Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const QuestionBank = lazy(() => import('./pages/QuestionBank').then(m => ({ default: m.QuestionBank })));
const TeacherQuizzes = lazy(() => import('./pages/TeacherQuizzes').then(m => ({ default: m.TeacherQuizzes })));
const AiQuizGenerator = lazy(() => import('./pages/AiQuizGenerator').then(m => ({ default: m.AiQuizGenerator })));
const ClassAnalytics = lazy(() => import('./pages/ClassAnalytics').then(m => ({ default: m.ClassAnalytics })));
const CourseMaterials = lazy(() => import('./pages/CourseMaterials').then(m => ({ default: m.CourseMaterials })));
const AtRiskStudents = lazy(() => import('./pages/AtRiskStudents').then(m => ({ default: m.AtRiskStudents })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ClassManagement = lazy(() => import('./pages/ClassManagement').then(m => ({ default: m.ClassManagement })));
const AcademicImport = lazy(() => import('./pages/AcademicImport').then(m => ({ default: m.AcademicImport })));
const PlatformSettings = lazy(() => import('./pages/PlatformSettings').then(m => ({ default: m.PlatformSettings })));
const AdminReports = lazy(() => import('./pages/AdminReports').then(m => ({ default: m.AdminReports })));
const AuditLogViewer = lazy(() => import('./pages/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));

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

const PageFallback = () => (
  <div className="py-20 flex justify-center items-center">
    <LoadingSpinner size="md" text="Loading view..." />
  </div>
);

const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main key={location.pathname} className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
          <Suspense fallback={<PageFallback />}>
            {children}
          </Suspense>
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
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><LoadingSpinner size="lg" text="Loading EduPulse..." /></div>}>
            <Routes>
              {/* Public Frontpage / Entry Point */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
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
                path="/student/ai-summary"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><StudentAiSummary /></Layout>
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
                path="/student/materials"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><StudentMaterials /></Layout>
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
                path="/student/quizzes/:quizId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><QuizTaking /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attempts/:attemptId/review"
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
                path="/student/results"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><StudentResultMarks /></Layout>
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
                path="/student/chat"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><AiStudyAssistant /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/privacy"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <Layout><StudentProfilePrivacy /></Layout>
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

              {/* === Teacher Routes === */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><TeacherDashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/questions"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><QuestionBank /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><TeacherQuizzes /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/generate"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><AiQuizGenerator /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/quizzes/ai-generate"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><AiQuizGenerator /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><ClassAnalytics /></Layout>
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
                path="/teacher/import"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><AcademicImport /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/at-risk"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                    <Layout><AtRiskStudents /></Layout>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
