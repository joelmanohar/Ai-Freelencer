import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('fh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      const path = window.location.pathname;
      const requestUrl = err.config?.url || '';
      const isPaymentRequest = requestUrl.includes('/payments/');
      if (!isPaymentRequest && !path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('fh_token');
        localStorage.removeItem('fh_user');
        window.location.replace('/login?session=expired');
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const projectApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getMy: () => api.get('/projects/my'),
  getPublicStats: () => api.get('/projects/stats')
};

export const proposalApi = {
  submit: (projectId, data) => api.post(`/proposals/project/${projectId}`, data),
  getByProject: (projectId) => api.get(`/proposals/project/${projectId}`),
  getMy: () => api.get('/proposals/my'),
  accept: (id) => api.post(`/proposals/${id}/accept`),
  reject: (id) => api.post(`/proposals/${id}/reject`)
};

export const messageApi = {
  getProjectMessages: (projectId) => api.get(`/messages/project/${projectId}`),
  sendMessage: (projectId, content) => api.post(`/messages/project/${projectId}`, { content })
};

export const paymentApi = {
  createOrder: (projectId, amount, token) => api.post('/payments/create-order', { projectId, amount }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  verify: (data) => api.post('/payments/verify', data),
  getMy: () => api.get('/payments/my'),
  getAll: () => api.get('/payments/all'),
  testEmail: () => api.post('/payments/test-email')
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const reviewApi = {
  create: (projectId, data) => api.post(`/reviews/project/${projectId}`, data),
  getByProject: (projectId) => api.get(`/reviews/project/${projectId}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`)
};

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: () => api.get('/users')
};

export const adminApi = {
  getStats: () => api.get('/admin/stats')
};

export const aiChatApi = {
  ask: (message, history = []) => api.post('/ai-chat', { message, history })
};

export default api;
