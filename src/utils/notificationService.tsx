"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification, NotificationProps } from '@progress/kendo-react-notification';

interface NotificationItem extends NotificationProps {
  id: string;
  content: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'onClose'> & { content: string }) => string;
  closeNotification: (id: string) => void;
  success: (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => string;
  info: (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => string;
  warning: (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => string;
  error: (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => string;
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

  const showNotification = (notification: Omit<NotificationProps, 'onClose'> & { content: string }) => {
    const id = Date.now().toString();
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { ...notification, id } as NotificationItem,
    ]);
    return id;
  };

  const closeNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Helper functions for common notification types
  const success = (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => {
    return showNotification({ 
      type: { style: 'success', icon: true },
      content,
      ...options
    });
  };
  
  const info = (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => {
    return showNotification({ 
      type: { style: 'info', icon: true },
      content,
      ...options
    });
  };
  
  const warning = (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => {
    return showNotification({ 
      type: { style: 'warning', icon: true },
      content,
      ...options
    });
  };
  
  const error = (content: string, options?: Partial<Omit<NotificationProps, 'type'>>) => {
    return showNotification({ 
      type: { style: 'error', icon: true },
      content,
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
          closable={true}
          onClose={() => closeNotification(notification.id)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '400px'
          }}
        >
          {notification.content}
        </Notification>
      ))}
    </NotificationContext.Provider>
  );
};

// Export a singleton instance for direct import
export const notificationService = {
  get instance() {
    return useNotifications();
  }
}; 