import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('%c[API Request]', 'color: green;', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
    });
  }

  return config;
}, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const url = error.config?.url;

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('%c[API Error]', 'color: red;', {
        status,
        message,
        url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
    }

    // Auto logout on 401 errors
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Display error toast for all client/server errors
    if (status >= 400) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
