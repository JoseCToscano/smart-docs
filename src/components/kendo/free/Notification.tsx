import { Notification as KendoNotification, NotificationProps as KendoNotificationProps, NotificationGroup, NotificationGroupProps } from '@progress/kendo-react-notification';
import React, { useEffect, useState, useCallback } from 'react';

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
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  
  // Closure for the close handler to be reused
  const handleClose = useCallback(() => {
    // Start the fade out animation
    setIsFading(true);
    
    // Allow animation to complete before unmounting
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose({} as any);
      }
    }, 300); // Match this to the CSS animation duration
  }, [onClose]);

  // Auto close effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoClose && autoCloseTimeout > 0 && isVisible) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseTimeout);
    }
    
    // Clear the timeout if the component unmounts or dependencies change
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoClose, autoCloseTimeout, isVisible, handleClose]);

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

  // Animation styles
  const animationStyle: React.CSSProperties = {
    animation: isFading ? 'fadeOut 300ms ease-out forwards' : 'fadeIn 300ms ease-in forwards',
    opacity: isFading ? 0 : 1,
    transition: 'opacity 300ms ease-out',
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
    ...animationStyle
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
      <div 
        style={notificationStyle} 
        className={`notification notification-${type}`}
        onMouseEnter={() => {
          // Pause the auto-close when user hovers
          if (autoClose) {
            // Reset timer on mouse enter by toggling visible state
            setIsVisible(true);
          }
        }}
      >
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
          onClick={() => handleClose()}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Add styles for fade animations
const createAnimationStyles = () => {
  if (typeof document !== 'undefined') {
    // Check if styles already exist
    if (!document.getElementById('notification-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-animations';
      style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Run once when component is first used
if (typeof window !== 'undefined') {
  createAnimationStyles();
}

export { Notification, NotificationGroup, type NotificationGroupProps };