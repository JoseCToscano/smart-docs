"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  
  // Debug: log whenever notifications change
  useEffect(() => {
    console.log('Current notifications:', notifications);
  }, [notifications]);

  const showNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Date.now().toString();
    console.log('Adding notification:', { id, ...notification });
    
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { ...notification, id },
    ]);
    return id;
  };

  const closeNotification = (id: string) => {
    console.log('Removing notification:', id);
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Helper functions for common notification types
  const success = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    console.log('Showing success notification:', message);
    return showNotification({ 
      message, 
      type: 'success', 
      ...options
    });
  };
  
  const info = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    console.log('Showing info notification:', message);
    return showNotification({ 
      message, 
      type: 'info', 
      ...options
    });
  };
  
  const warning = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    console.log('Showing warning notification:', message);
    return showNotification({ 
      message, 
      type: 'warning', 
      ...options
    });
  };
  
  const error = (message: string, options?: Partial<Omit<NotificationProps, 'message' | 'type'>>) => {
    console.log('Showing error notification:', message);
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
      {notifications.length > 0 && (
        <>
          {notifications.map((notification) => {
            console.log(`Rendering notification: ${notification.id}`);
            return (
              <Notification
                key={notification.id}
                type={notification.type}
                message={notification.message}
                position={notification.position}
                autoClose={notification.autoClose}
                autoCloseTimeout={notification.autoCloseTimeout}
                onClose={() => closeNotification(notification.id)}
              />
            );
          })}
        </>
      )}
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