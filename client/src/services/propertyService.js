import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/properties`;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Create axios instance with default config
const propertyApi = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
propertyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
propertyApi.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

export const propertyService = {
  async getProperties(params) {
    try {
      const response = await propertyApi.get('', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  },

  async getPropertyById(id) {
    try {
      const response = await propertyApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  },

  async createProperty(propertyData) {
    try {
      const response = await propertyApi.post('', propertyData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  },

  async updateProperty(id, propertyData) {
    try {
      const response = await propertyApi.put(`/${id}`, propertyData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  },

  async deleteProperty(id) {
    try {
      await propertyApi.delete(`/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  },

  async toggleFavorite(id) {
    try {
      const response = await propertyApi.post(`/${id}/favorite`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }
  },

  async searchProperties(filters) {
    try {
      const response = await propertyApi.get('/search', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  },

  async getPropertyStats() {
    try {
      const response = await propertyApi.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch property stats: ${error.message}`);
    }
  },

  async uploadImages(propertyId, images) {
    try {
      const formData = new FormData();
      images.forEach(image => formData.append('images', image));
      
      const response = await propertyApi.post(`/${propertyId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }
};