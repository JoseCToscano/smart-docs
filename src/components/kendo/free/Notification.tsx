"use client";

import React, { useState, useEffect } from 'react';
import { 
  Notification as KendoNotification,
  NotificationGroup
} from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import '@progress/kendo-theme-default/dist/all.css';

export interface NotificationProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  position?: 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
  autoClose?: boolean;
  autoCloseTimeout?: number;
  onClose?: () => void;
}

const defaultProps = {
  type: 'info' as const,
  position: 'top-end' as const,
  autoClose: true,
  autoCloseTimeout: 5000,
};

const Notification: React.FC<NotificationProps> = (props) => {
  const { 
    type, 
    message, 
    position, 
    autoClose, 
    autoCloseTimeout, 
    onClose 
  } = { ...defaultProps, ...props };
  
  const [visible, setVisible] = useState(true);

  // Auto-close functionality
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoClose && visible) {
      timeout = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTimeout);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [autoClose, autoCloseTimeout, onClose, visible]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Render directly with proper positioning
  const getNotificationStyle = (): React.CSSProperties => {
    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '400px',
    };

    switch (position) {
      case 'top-start':
        style = { ...style, top: '20px', left: '20px' };
        break;
      case 'top-center':
        style = { ...style, top: '20px', left: '50%', transform: 'translateX(-50%)' };
        break;
      case 'top-end':
        style = { ...style, top: '20px', right: '20px' };
        break;
      case 'bottom-start':
        style = { ...style, bottom: '20px', left: '20px' };
        break;
      case 'bottom-center':
        style = { ...style, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
        break;
      case 'bottom-end':
        style = { ...style, bottom: '20px', right: '20px' };
        break;
      default:
        style = { ...style, top: '20px', right: '20px' };
    }

    return style;
  };

  if (!visible) {
    return null;
  }

  return (
    <div style={getNotificationStyle()} className="k-notification-container">
      <Fade>
        <NotificationGroup>
          <KendoNotification
            type={{ style: type, icon: true }}
            closable={true}
            onClose={handleClose}
            className={`k-notification-${type}`}
          >
            <div className="k-notification-content">
              {message}
            </div>
          </KendoNotification>
        </NotificationGroup>
      </Fade>
    </div>
  );
};

export default Notification; 