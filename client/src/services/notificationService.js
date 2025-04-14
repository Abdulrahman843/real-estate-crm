import api from './api';

export const notificationService = {
  /**
   * Fetch notifications, optionally filtered by category.
   */
  async getNotifications(category = '') {
    try {
      const res = await api.get(`/notifications${category ? `?category=${category}` : ''}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId) {
    try {
      const res = await api.put(`/notifications/${notificationId}/read`);
      return res.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read. Accepts optional category.
   */
  async markAllAsRead(category = '') {
    try {
      const res = await api.put('/notifications/read-all', { category });
      return res.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Delete a specific notification.
   */
  async deleteNotification(notificationId) {
    try {
      const res = await api.delete(`/notifications/${notificationId}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  /**
   * Get count of unread notifications.
   */
  async getUnreadCount() {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  /**
   * Real-time notification listener via WebSocket.
   * Pass a callback to handle incoming notifications.
   */
  subscribeToNotifications(callback) {
    const ws = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/notifications`);

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        callback(notification);
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close(); // Return cleanup function
  }
};
