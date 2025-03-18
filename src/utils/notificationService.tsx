"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationProps } from '../components/kendo/free/Notification';

interface NotificationItem extends NotificationProps {
  id: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'onClose'>) => string;
  closeNotification: (id: string) => void;
  success: (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => string;
  info: (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => string;
  warning: (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => string;
  error: (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Date.now().toString();
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { ...notification, id },
    ]);
    return id;
  };

  const closeNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Helper functions for common notification types
  const success = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    return showNotification({ 
      message, 
      type: 'success', 
      ...options
    });
  };
  
  const info = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    return showNotification({ 
      message, 
      type: 'info', 
      ...options
    });
  };
  
  const warning = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    return showNotification({ 
      message, 
      type: 'warning', 
      ...options
    });
  };
  
  const error = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    return showNotification({ 
      message, 
      type: 'error', 
      ...options
    });
  };

  const contextValue = {
    showNotification,
    closeNotification,
    success,
    info,
    warning,
    error
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          position={notification.position}
          autoClose={notification.autoClose}
          autoCloseTimeout={notification.autoCloseTimeout}
          onClose={() => closeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Export a singleton instance for direct import
export const notificationService = {
  get instance() {
    // This will throw an error if used outside of NotificationProvider
    // which is expected behavior
    return useNotifications();
  }
}; 