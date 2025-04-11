import api from './api';

export const notificationService = {
  getNotifications: async (category = '') => {
    try {
      const response = await api.get(`/notifications${category ? `?category=${category}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  markAllAsRead: async (category = '') => {
    try {
      const response = await api.put('/notifications/read-all', { category });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  subscribeToNotifications: (callback) => {
    const ws = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/notifications`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      callback(notification);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }
};