import api from './api';

export const searchService = {
  getAutocompleteSuggestions: async (query) => {
    try {
      const response = await api.get(`/properties/autocomplete?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
};