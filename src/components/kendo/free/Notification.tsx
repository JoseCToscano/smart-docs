import { Notification as KendoNotification, NotificationProps as KendoNotificationProps, NotificationGroup, NotificationGroupProps } from '@progress/kendo-react-notification';
import React from 'react';

// Fix the type error by making our NotificationProps properly extend KendoNotificationProps
export interface NotificationProps extends Omit<KendoNotificationProps, 'type'> {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  autoClose?: boolean;
  autoCloseTimeout?: number;
}

const Notification = ({ 
  type, 
  message, 
  position = 'top-center',
  autoClose = true,
  autoCloseTimeout = 5000,
  onClose,
  ...props 
}: NotificationProps) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && autoCloseTimeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose({} as any);
        }
      }, autoCloseTimeout);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTimeout, onClose]);

  if (!isVisible) {
    return null;
  }

  // Position styles
  const positionStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  switch (position) {
    case 'top-left':
      positionStyle.top = '20px';
      positionStyle.left = '20px';
      break;
    case 'top-center':
      positionStyle.top = '20px';
      positionStyle.left = '50%';
      positionStyle.transform = 'translateX(-50%)';
      break;
    case 'top-right':
      positionStyle.top = '20px';
      positionStyle.right = '20px';
      break;
    case 'bottom-left':
      positionStyle.bottom = '20px';
      positionStyle.left = '20px';
      break;
    case 'bottom-center':
      positionStyle.bottom = '20px';
      positionStyle.left = '50%';
      positionStyle.transform = 'translateX(-50%)';
      break;
    case 'bottom-right':
      positionStyle.bottom = '20px';
      positionStyle.right = '20px';
      break;
    default:
      positionStyle.top = '20px';
      positionStyle.left = '50%';
      positionStyle.transform = 'translateX(-50%)';
  }

  // Color styles based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'info': return '#d1ecf1';
      case 'warning': return '#fff3cd';
      case 'error': return '#f8d7da';
      default: return '#d1ecf1';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#c3e6cb';
      case 'info': return '#bee5eb';
      case 'warning': return '#ffeeba';
      case 'error': return '#f5c6cb';
      default: return '#bee5eb';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success': return '#155724';
      case 'info': return '#0c5460';
      case 'warning': return '#856404';
      case 'error': return '#721c24';
      default: return '#0c5460';
    }
  };

  // Custom notification style that doesn't rely on Kendo CSS
  const notificationStyle: React.CSSProperties = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    color: getTextColor(),
    padding: '12px 16px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '250px',
    maxWidth: '400px',
    borderLeft: `4px solid ${getBorderColor()}`,
    position: 'relative',
    marginBottom: '10px',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
  };

  // Styles for the close button
  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: getTextColor(),
    opacity: 0.7,
  };

  return (
    <div style={positionStyle} className="notification-container">
      <div style={notificationStyle} className={`notification notification-${type}`}>
        <div style={{ marginRight: '8px' }}>
          {type === 'success' && '✅'}
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
        </div>
        <div className="notification-content" style={{ flex: 1 }}>
          {message}
        </div>
        <button 
          style={closeButtonStyle}
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              onClose({} as any);
            }
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export { Notification, NotificationGroup, type NotificationGroupProps };