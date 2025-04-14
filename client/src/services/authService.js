import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authApi = axios.create({
  baseURL: `${BASE_URL}/api`, // Central baseURL for all auth requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to requests
authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling (optional)
authApi.interceptors.response.use(
  res => res,
  error => {
    const msg = error?.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

const authService = {
  async login(credentials) {
    const res = await authApi.post('/auth/login', credentials);
    const { token, _id, name, email, role } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ _id, name, email, role }));

    return { token, user: { _id, name, email, role } };
  },

  async register(userData) {
    const res = await authApi.post('/auth/register', userData);
    const { token, _id, name, email, role } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ _id, name, email, role }));

    return { token, user: { _id, name, email, role } };
  },

  async getCurrentUser() {
    const res = await authApi.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async forgotPassword(email) {
    const res = await authApi.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await authApi.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  }
};

export default authService;
