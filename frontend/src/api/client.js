/**
 * EduPulse API Client
 * Centralized fetch wrapper with automatic JWT injection and error handling.
 */

export const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('edupulse_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || (typeof data === 'string' ? data : `HTTP ${response.status}`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

export const studentApi = {
  getDashboard: () => apiRequest('/student/dashboard'),
  getProfile: () => apiRequest('/student/profile'),
  getSubjects: () => apiRequest('/student/subjects'),
  getAssignedQuizzes: () => apiRequest('/student/quizzes'),
  startQuizAttempt: (quizId) => apiRequest(`/student/quizzes/${quizId}/start`, { method: 'POST' }),
  submitQuizAttempt: (attemptId, answers, times) =>
    apiRequest(`/student/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, times }),
    }),
  getAttemptReview: (attemptId) => apiRequest(`/student/attempts/${attemptId}/review`),
  getRecommendations: () => apiRequest('/student/recommendations'),
  getPerformance: () => apiRequest('/student/performance'),
  getAcademicRecords: () => apiRequest('/student/academic-records'),

  // AI Assistant Chat APIs
  getChatSessions: () => apiRequest('/student/chat/sessions'),
  createChatSession: (title) => apiRequest('/student/chat/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
  getSessionMessages: (sessionId) => apiRequest(`/student/chat/sessions/${sessionId}/messages`),
  sendChatMessage: (sessionId, message, tutoringMode = 'EXPLANATORY', subjectId = null) =>
    apiRequest(`/student/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, tutoringMode, subjectId: subjectId ? String(subjectId) : null }),
    }),
  deleteChatSession: (sessionId) => apiRequest(`/student/chat/sessions/${sessionId}`, { method: 'DELETE' }),
  exportMyData: () => apiRequest('/student/export-my-data'),
  getAvailableMaterials: () => apiRequest('/student/materials'),
  getAiSummary: () => apiRequest('/student/ai-summary'),
  generateAiSummary: () => apiRequest('/student/ai-summary/generate', { method: 'POST' }),
  retrieveCoursePassages: (query, subjectIds, topK = 3) =>
    apiRequest('/student/materials/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, subjectIds, topK }),
    }),
};

export const teacherApi = {
  getDashboard: () => apiRequest('/teacher/dashboard'),
  getProfile: () => apiRequest('/teacher/profile'),
  getSubjects: () => apiRequest('/teacher/subjects'),
  createSubject: (data) => apiRequest('/teacher/subjects', { method: 'POST', body: JSON.stringify(data) }),
  getTopics: (subjectId) => apiRequest(`/teacher/topics${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createTopic: (data) => apiRequest('/teacher/topics', { method: 'POST', body: JSON.stringify(data) }),
  getQuestions: (topicId) => apiRequest(`/teacher/questions${topicId ? `?topicId=${topicId}` : ''}`),
  createQuestion: (data) => apiRequest('/teacher/questions', { method: 'POST', body: JSON.stringify(data) }),
  getQuizzes: () => apiRequest('/teacher/quizzes'),
  createQuiz: (data) => apiRequest('/teacher/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  publishQuiz: (quizId) => apiRequest(`/teacher/quizzes/${quizId}/publish`, { method: 'POST' }),
  assignQuiz: (quizId, classId) => apiRequest(`/teacher/quizzes/${quizId}/assign`, { method: 'POST', body: JSON.stringify({ classId }) }),
  generateAiQuiz: (data) => apiRequest('/teacher/quizzes/ai-generate', { method: 'POST', body: JSON.stringify(data) }),
  getClasses: () => apiRequest('/teacher/classes'),
  getClassAnalytics: () => apiRequest('/teacher/analytics'),
  getCourseMaterials: () => apiRequest('/teacher/materials'),
  deleteCourseMaterial: (id) => apiRequest(`/teacher/materials/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getAllUsers: () => apiRequest('/admin/users'),
  createUser: (userData) => apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => apiRequest('/admin/profile'),
};
