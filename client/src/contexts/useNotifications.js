// src/contexts/useNotifications.js
import { useContext } from 'react';
import NotificationContext from './NotificationContext';

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
