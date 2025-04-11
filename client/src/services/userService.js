import api from './api';
import { validateProfile } from '../utils/validation';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const validationResult = validateProfile(profileData);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join(', '));
    }
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/users/notifications', settings);
    return response.data;
  },

  getActivityLog: async () => {
    const response = await api.get('/users/activity');
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/users/account', {
      data: { password }
    });
    return response.data;
  },

  exportUserData: async () => {
    const response = await api.get('/users/export-data');
    return response.data;
  },

  getTwoFactorSetup: async () => {
    const response = await api.get('/users/2fa/setup');
    return response.data;
  },

  enableTwoFactor: async (code) => {
    const response = await api.post('/users/2fa/enable', { code });
    return response.data;
  }
};