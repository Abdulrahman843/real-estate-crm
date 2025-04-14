// src/contexts/NotificationProvider.jsx
import React, { useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import useAuth from './useAuth';
import NotificationContext from './NotificationContext';

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      websocketService.connect(user.id);
      websocketService.subscribeToNotifications((data) => {
        setNotifications(prev => [data, ...prev]);
      });

      return () => websocketService.disconnect();
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

export default NotificationProvider;
