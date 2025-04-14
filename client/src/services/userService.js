import api from './api';
import { validateProfile } from '../utils/validation';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update user profile with validation
  updateProfile: async (profileData) => {
    try {
      const validationResult = validateProfile(profileData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  },

  // Change password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  },

  // Update notification preferences
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/users/notifications', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  },

  // Fetch recent activity logs
  getActivityLog: async () => {
    try {
      const response = await api.get('/users/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch activity log');
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/users/account', { data: { password } });
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },

  // Export user data
  exportUserData: async () => {
    try {
      const response = await api.get('/users/export-data');
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(error.response?.data?.message || 'Failed to export user data');
    }
  },

  // Get 2FA setup
  getTwoFactorSetup: async () => {
    try {
      const response = await api.get('/users/2fa/setup');
      return response.data;
    } catch (error) {
      console.error('Error getting 2FA setup:', error);
      throw new Error(error.response?.data?.message || 'Failed to get 2FA setup');
    }
  },

  // Enable 2FA with verification code
  enableTwoFactor: async (code) => {
    try {
      const response = await api.post('/users/2fa/enable', { code });
      return response.data;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw new Error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  }
};
