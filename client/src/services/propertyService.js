// services/propertyService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Axios instances
const propertyApi = axios.create({
  baseURL: `${BASE_URL}/api/properties`,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
});

const dashboardApi = axios.create({
  baseURL: `${BASE_URL}/api/dashboard`,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
});

// Token interceptors
[propertyApi, dashboardApi].forEach(api => {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    res => res,
    err => {
      const message = err.response?.data?.message || err.message || 'API Error';
      console.error(`[API Error] ${message}`);
      throw new Error(message);
    }
  );
});

export const propertyService = {
  // Dashboard
  getDashboardStats: async () => (await dashboardApi.get('/')).data,

  // Properties
  getProperties: async (params = {}) => (await propertyApi.get('', { params })).data,
  getPropertyById: async id => (await propertyApi.get(`/${id}`)).data,
  createProperty: async data => (await propertyApi.post('', data)).data,
  updateProperty: async (id, data) => (await propertyApi.put(`/${id}`, data)).data,
  deleteProperty: async id => (await propertyApi.delete(`/${id}`)).data,

  // Agent-specific
  getAgentProperties: async (agentId) =>
    (await propertyApi.get(`/agent/${agentId}`)).data,

  // Favorites
  getFavorites: async () => (await propertyApi.get('/favorites/me')).data,
  toggleFavorite: async id => (await propertyApi.post(`/${id}/favorite`)).data,

  // Search & Featured
  searchProperties: async filters => (await propertyApi.get('/search', { params: filters })).data,
  getFeaturedProperties: async () => (await propertyApi.get('/featured')).data,

  // Analytics
  getPropertyAnalytics: async id => (await propertyApi.get(`/${id}/analytics`)).data,
  trackView: async id => (await propertyApi.post(`/${id}/track`)).data,

  // Reviews & Reports
  submitReview: async (propertyId, reviewData) =>
    (await propertyApi.post(`/${propertyId}/reviews`, reviewData)).data,
  getReviews: async propertyId =>
    (await propertyApi.get(`/${propertyId}/reviews`)).data,
  reportProperty: async (propertyId, reportData) =>
    (await propertyApi.post(`/${propertyId}/report`, reportData)).data,

  // Images
  uploadImages: async (propertyId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return (await propertyApi.post(`/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },
  deleteImage: async (propertyId, imageId) =>
    (await propertyApi.delete(`/${propertyId}/images/${imageId}`)).data,

  // Gallery (optional)
  uploadGallery: async (propertyId, galleryData) => {
    return (await propertyApi.post(`/${propertyId}/gallery`, galleryData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  // Status update
  updateStatus: async (propertyId, status) =>
    (await propertyApi.patch(`/${propertyId}/status`, { status })).data,
};

 