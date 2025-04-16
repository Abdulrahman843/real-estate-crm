import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Axios instances
const propertyApi = axios.create({
  baseURL: `${BASE_URL}/api/properties`,
  timeout: API_TIMEOUT
});

const dashboardApi = axios.create({
  baseURL: `${BASE_URL}/api/dashboard`,
  timeout: API_TIMEOUT
});

// Token interceptors
[propertyApi, dashboardApi].forEach(api => {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Allow the content type to be set per-request
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  });

  api.interceptors.response.use(
    response => response,
    error => {
      const message = error.response?.data?.message || error.message || 'API Error';
      console.error(`[API Error] ${message}`);
      return Promise.reject(error);
    }
  );
});

export const propertyService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await dashboardApi.get('/');
    return response.data;
  },

  // Properties
  getProperties: async (params = {}) => {
    const response = await propertyApi.get('', { params });
    return response.data;
  },

  getPropertyById: async (id) => {
    const response = await propertyApi.get(`/${id}`);
    return response.data;
  },

  createProperty: async (data) => {
    const config = {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    const response = await propertyApi.post('', data, config);
    return response.data;
  },

  updateProperty: async (id, data) => {
    const config = {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    const response = await propertyApi.put(`/${id}`, data, config);
    return response.data;
  },

  deleteProperty: async (id) => {
    const response = await propertyApi.delete(`/${id}`);
    return response.data;
  },

  // Agent-specific
  getAgentProperties: async (agentId) => {
    const response = await propertyApi.get(`/agent/${agentId}`);
    return response.data;
  },

  // Favorites
  getFavorites: async () => {
    const response = await propertyApi.get('/favorites/me');
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await propertyApi.post(`/${id}/favorite`);
    return response.data;
  },

  // Search & Featured
  searchProperties: async (filters) => {
    const response = await propertyApi.get('/search', { params: filters });
    return response.data;
  },

  getFeaturedProperties: async () => {
    const response = await propertyApi.get('/featured');
    return response.data;
  },

  // Analytics
  getPropertyAnalytics: async (id) => {
    const response = await propertyApi.get(`/${id}/analytics`);
    return response.data;
  },

  trackView: async (id) => {
    const response = await propertyApi.post(`/${id}/track`);
    return response.data;
  },

  // Reviews & Reports
  submitReview: async (propertyId, reviewData) => {
    const response = await propertyApi.post(`/${propertyId}/reviews`, reviewData);
    return response.data;
  },

  getReviews: async (propertyId) => {
    const response = await propertyApi.get(`/${propertyId}/reviews`);
    return response.data;
  },

  reportProperty: async (propertyId, reportData) => {
    const response = await propertyApi.post(`/${propertyId}/report`, reportData);
    return response.data;
  },

  // Images
  uploadImages: async (propertyId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await propertyApi.post(`/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteImage: async (propertyId, imageId) => {
    const response = await propertyApi.delete(`/${propertyId}/images/${imageId}`);
    return response.data;
  },

  // Gallery
  uploadGallery: async (propertyId, galleryData) => {
    const response = await propertyApi.post(`/${propertyId}/gallery`, galleryData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Status update
  updateStatus: async (propertyId, status) => {
    const response = await propertyApi.patch(`/${propertyId}/status`, { status });
    return response.data;
  }
};