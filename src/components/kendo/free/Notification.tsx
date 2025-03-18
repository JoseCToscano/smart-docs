import { Notification as KendoNotification, NotificationProps as KendoNotificationProps, NotificationGroup, NotificationGroupProps } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import React from 'react';

// Fix the type error by making our NotificationProps properly extend KendoNotificationProps
export interface NotificationProps extends Omit<KendoNotificationProps, 'type'> {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  autoClose?: boolean;
  autoCloseTimeout?: number;
}

const getPositionStyles = (position: NotificationProps['position'] = 'top-center'): React.CSSProperties => {
  const styles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  switch (position) {
    case 'top-left':
      styles.top = '20px';
      styles.left = '20px';
      break;
    case 'top-center':
      styles.top = '20px';
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      break;
    case 'top-right':
      styles.top = '20px';
      styles.right = '20px';
      break;
    case 'bottom-left':
      styles.bottom = '20px';
      styles.left = '20px';
      break;
    case 'bottom-center':
      styles.bottom = '20px';
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      break;
    case 'bottom-right':
      styles.bottom = '20px';
      styles.right = '20px';
      break;
    default:
      styles.top = '20px';
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
  }

  return styles;
};

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
          onClose({} as any);  // Pass empty event object
        }
      }, autoCloseTimeout);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTimeout, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div style={getPositionStyles(position)} className="k-notification-container">
      <Fade>
        <NotificationGroup>
          <KendoNotification 
            {...props} 
            type={{ style: type, icon: true }}
            closable={true}
            onClose={(e) => {
              setIsVisible(false);
              if (onClose) {
                onClose(e);
              }
            }}
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

export { Notification, NotificationGroup, type NotificationGroupProps };