import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authApi.interceptors.response.use(
  res => res,
  err => {
    const msg = err?.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

const authService = {
  async login(credentials) {
    try {
      const res = await authApi.post('/auth/login', credentials);
      const { token, _id, name, email, role } = res.data || {};

      if (!token || !_id || !email) {
        throw new Error('Invalid login response. Please try again.');
      }

      const user = { _id, name, email, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (err) {
      console.error('Login failed:', err.message);
      throw err;
    }
  },

  async register(data) {
    const res = await authApi.post('/auth/register', data);
    const { token, _id, name, email, role } = res.data;
    const user = { _id, name, email, role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
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
