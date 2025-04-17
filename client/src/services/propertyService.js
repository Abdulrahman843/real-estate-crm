// real-estate-crm/client/src/services/propertyService.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// Axios instance for properties
const propertyApi = axios.create({
  baseURL: `${BASE_URL}/properties`,
  timeout: API_TIMEOUT,
  withCredentials: true
});

// Axios instance for dashboard
const dashboardApi = axios.create({
  baseURL: `${BASE_URL}/dashboard`,
  timeout: API_TIMEOUT,
  withCredentials: true
});

// Add Authorization headers to both instances
[propertyApi, dashboardApi].forEach(api => {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    res => res,
    err => {
      console.error('API Error:', err.response?.data || err.message);
      return Promise.reject(err);
    }
  );
});

export const propertyService = {
  // 🧩 Dashboard stats
  getDashboardStats: async () => {
    const res = await dashboardApi.get('/');
    return res.data;
  },

  // 📥 Fetch properties (with pagination + filters)
  getProperties: async (params = {}) => {
    try {
      console.log("📤 GET /api/properties with params:", params);
      const res = await propertyApi.get('/', { params });
      console.log("📥 Response from /api/properties:", res);
      return res; // 👈 Return FULL Axios response so `PropertyList.jsx` can use `res.data.properties`
    } catch (err) {
      console.error("❌ Failed to fetch properties:", err);
      throw err;
    }
  },

  // 📄 Get single property
  getPropertyById: async (id) => {
    const res = await propertyApi.get(`/${id}`);
    return res.data;
  },

  // 🆕 Create property
  createProperty: async (formData) => {
    const res = await propertyApi.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json'
      }
    });
    return res.data;
  },

  // ✏️ Update property
  updateProperty: async (id, data) => {
    const isFormData = data instanceof FormData;
    const res = await propertyApi.put(`/${id}`, data, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data', Accept: 'application/json' }
        : {}
    });
    return res.data;
  },

  // 🗑 Delete property
  deleteProperty: async (id) => {
    const res = await propertyApi.delete(`/${id}`);
    return res.data;
  },

  // 👤 Get properties by agent
  getAgentProperties: async (agentId) => {
    const res = await propertyApi.get(`/agent/${agentId}`);
    return res.data;
  },

  // ⭐ Favorites
  getFavorites: async () => {
    const res = await propertyApi.get('/favorites/me');
    return res.data;
  },

  toggleFavorite: async (id) => {
    const res = await propertyApi.post(`/${id}/favorite`);
    return res.data;
  },

  // 🔍 Search / filters (for advanced use)
  searchProperties: async (filters = {}) => {
    const res = await propertyApi.get('/search', { params: filters });
    return res.data;
  },

  // 🌟 Get featured listings
  getFeaturedProperties: async () => {
    const res = await propertyApi.get('/featured');
    return res.data;
  },

  // 🖼 Upload images
  uploadImages: async (propertyId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const res = await propertyApi.post(`/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json'
      }
    });
    return res.data;
  },

  deleteImage: async (propertyId, imageId) => {
    const res = await propertyApi.delete(`/${propertyId}/images/${imageId}`);
    return res.data;
  },

  // ✅ Update listing status (e.g. available/sold)
  updateStatus: async (propertyId, status) => {
    const res = await propertyApi.patch(`/${propertyId}/status`, { status });
    return res.data;
  }
};
