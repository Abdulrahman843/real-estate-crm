import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // Connect WebSocket with user ID
      websocketService.connect(user.id);

      // Subscribe to notifications
      websocketService.subscribeToNotifications((data) => {
        setNotifications(prev => [data, ...prev]);
      });

      return () => {
        websocketService.disconnect();
      };
    }
  }, [user]);

  const value = {
    notifications,
    setNotifications,
    clearNotifications: () => setNotifications([])
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};