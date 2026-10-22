import { apiRequest, API_BASE } from '../api/client';

const api = {
  get: async (url, options = {}) => {
    if (options.responseType === 'blob') {
      const token = localStorage.getItem('edupulse_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const fullUrl = `${API_BASE}${url.startsWith('/') ? url : '/' + url}`;
      const res = await fetch(fullUrl, { headers });
      const blob = await res.blob();
      return { data: blob };
    }
    const data = await apiRequest(url, { method: 'GET', ...options });
    return { data };
  },
  post: async (url, body, options = {}) => {
    const data = await apiRequest(url, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      ...options
    });
    return { data };
  },
  put: async (url, body, options = {}) => {
    const data = await apiRequest(url, {
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      ...options
    });
    return { data };
  },
  delete: async (url, options = {}) => {
    const data = await apiRequest(url, { method: 'DELETE', ...options });
    return { data };
  }
};

export default api;
export { api };
