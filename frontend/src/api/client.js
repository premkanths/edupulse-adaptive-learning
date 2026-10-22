/**
 * EduPulse API Client
 * Centralized fetch wrapper with automatic JWT injection, in-memory caching, and error handling.
 */

const getApiBase = () => {
  let base = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  if (base.startsWith('http') && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
};

export const API_BASE = getApiBase();

// High-speed in-memory cache for GET requests (SWR pattern)
const apiCache = new Map();
const CACHE_TTL_MS = 60000; // 60 seconds TTL

export function clearApiCache(endpointPrefix = '') {
  if (!endpointPrefix) {
    apiCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.includes(endpointPrefix)) {
        apiCache.delete(key);
      }
    }
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('edupulse_token');
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = `${token ? 'auth' : 'anon'}:${endpoint}`;

  // Serve from memory cache immediately if available for GET requests
  if (isGet && !options.noCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  // Any mutation (POST/PUT/DELETE) invalidates the cache to maintain fresh data
  if (!isGet) {
    clearApiCache();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // If body is FormData, let browser set multipart boundary header
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

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

  // Save successful GET response to cache
  if (isGet && !options.noCache) {
    apiCache.set(cacheKey, { timestamp: Date.now(), data });
  }

  return data;
}

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me: () => apiRequest('/auth/me'),
  logout: () => {
    clearApiCache();
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

export const studentApi = {
  getDashboard: (options) => apiRequest('/student/dashboard', options),
  getProfile: (options) => apiRequest('/student/profile', options),
  getSubjects: (options) => apiRequest('/student/subjects', options),
  getAssignedQuizzes: (options) => apiRequest('/student/quizzes', options),
  startQuizAttempt: (quizId) => apiRequest(`/student/quizzes/${quizId}/start`, { method: 'POST' }),
  submitQuizAttempt: (attemptId, answers, times) =>
    apiRequest(`/student/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, times }),
    }),
  getAttemptReview: (attemptId) => apiRequest(`/student/attempts/${attemptId}/review`),
  getRecommendations: (options) => apiRequest('/student/recommendations', options),
  getPerformance: (options) => apiRequest('/student/performance', options),
  getAcademicRecords: (options) => apiRequest('/student/academic-records', options),

  // AI Assistant Chat APIs
  getChatSessions: () => apiRequest('/student/chat/sessions', { noCache: true }),
  createChatSession: (title) => apiRequest('/student/chat/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
  getSessionMessages: (sessionId) => apiRequest(`/student/chat/sessions/${sessionId}/messages`, { noCache: true }),
  sendChatMessage: (sessionId, message, tutoringMode = 'EXPLANATORY', subjectId = null) =>
    apiRequest(`/student/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, tutoringMode, subjectId: subjectId ? String(subjectId) : null }),
    }),
  deleteChatSession: (sessionId) => apiRequest(`/student/chat/sessions/${sessionId}`, { method: 'DELETE' }),
  exportMyData: () => apiRequest('/student/export-my-data'),
  getAvailableMaterials: (options) => apiRequest('/student/materials', options),
  getMaterialFileUrl: (id) => `${API_BASE}/materials/${id}/file`,
  getExamPapers: (options) => apiRequest('/student/exam-papers', options),
  analyzeExamPaper: (formData) => apiRequest('/student/exam-papers/analyze', { method: 'POST', body: formData }),
  getAiSummary: (options) => apiRequest('/student/ai-summary', options),
  generateAiSummary: () => apiRequest('/student/ai-summary/generate', { method: 'POST' }),
  retrieveCoursePassages: (query, subjectIds, topK = 3) =>
    apiRequest('/student/materials/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, subjectIds, topK }),
    }),
};

export const teacherApi = {
  getDashboard: (options) => apiRequest('/teacher/dashboard', options),
  getProfile: (options) => apiRequest('/teacher/profile', options),
  getSubjects: (options) => apiRequest('/teacher/subjects', options),
  createSubject: (data) => apiRequest('/teacher/subjects', { method: 'POST', body: JSON.stringify(data) }),
  getTopics: (subjectId) => apiRequest(`/teacher/topics${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createTopic: (data) => apiRequest('/teacher/topics', { method: 'POST', body: JSON.stringify(data) }),
  getQuestions: (topicId) => apiRequest(`/teacher/questions${topicId ? `?topicId=${topicId}` : ''}`),
  createQuestion: (data) => apiRequest('/teacher/questions', { method: 'POST', body: JSON.stringify(data) }),
  getQuizzes: (options) => apiRequest('/teacher/quizzes', options),
  createQuiz: (data) => apiRequest('/teacher/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  publishQuiz: (quizId) => apiRequest(`/teacher/quizzes/${quizId}/publish`, { method: 'POST' }),
  assignQuiz: (quizId, classId) => apiRequest(`/teacher/quizzes/${quizId}/assign`, { method: 'POST', body: JSON.stringify({ classId }) }),
  generateAiQuiz: (data) => apiRequest('/teacher/quizzes/ai-generate', { method: 'POST', body: JSON.stringify(data) }),
  getClasses: (options) => apiRequest('/teacher/classes', options),
  getClassAnalytics: (options) => apiRequest('/teacher/analytics', options),
  getCourseMaterials: (options) => apiRequest('/teacher/materials', options),
  deleteCourseMaterial: (id) => apiRequest(`/teacher/materials/${id}`, { method: 'DELETE' }),
  sendWeeklySummaryToStudent: (studentId) => apiRequest('/teacher/notifications/send-weekly-summary', { method: 'POST', body: JSON.stringify({ studentId }) }),
};

export const adminApi = {
  getDashboard: (options) => apiRequest('/admin/dashboard', options),
  getAllUsers: (options) => apiRequest('/admin/users', options),
  createUser: (userData) => apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: (options) => apiRequest('/admin/profile', options),
  dispatchWeeklySummaries: () => apiRequest('/admin/notifications/send-weekly-summaries', { method: 'POST' }),
};
