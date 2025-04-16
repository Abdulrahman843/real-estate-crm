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
    return config;
  });

  api.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', error.response?.data || error.message);
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

  createProperty: async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    };

    console.log('Creating property with data:', formData);
    const response = await propertyApi.post('/', formData, config);
    console.log('Property created:', response.data);
    return response;
  },

  updateProperty: async (id, data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    } : {};

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

  // Images
  uploadImages: async (propertyId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await propertyApi.post(`/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  deleteImage: async (propertyId, imageId) => {
    const response = await propertyApi.delete(`/${propertyId}/images/${imageId}`);
    return response.data;
  },

  // Status update
  updateStatus: async (propertyId, status) => {
    const response = await propertyApi.patch(`/${propertyId}/status`, { status });
    return response.data;
  }
};
