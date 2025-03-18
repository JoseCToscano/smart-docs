"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Notification as KendoNotification,
  NotificationGroup
} from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import { Popup } from '@progress/kendo-react-popup';
import { Align } from '@progress/kendo-react-popup';
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
  
  console.log('Rendering notification:', { type, message, position });
  
  const [visible, setVisible] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Handle positioning
  const getPosition = (): Align => {
    switch (position) {
      case 'top-start': return { horizontal: 'left', vertical: 'top' };
      case 'top-center': return { horizontal: 'center', vertical: 'top' };
      case 'top-end': return { horizontal: 'right', vertical: 'top' };
      case 'bottom-start': return { horizontal: 'left', vertical: 'bottom' };
      case 'bottom-center': return { horizontal: 'center', vertical: 'bottom' };
      case 'bottom-end': return { horizontal: 'right', vertical: 'bottom' };
      default: return { horizontal: 'right', vertical: 'top' };
    }
  };

  // Auto-close functionality
  useEffect(() => {
    console.log('Notification mounted, visible:', visible);
    let timeout: NodeJS.Timeout;
    if (autoClose && visible) {
      console.log(`Setting timeout for ${autoCloseTimeout}ms`);
      timeout = setTimeout(() => {
        console.log('Auto-closing notification');
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTimeout);
    }
    return () => {
      if (timeout) {
        console.log('Clearing timeout');
        clearTimeout(timeout);
      }
    };
  }, [autoClose, autoCloseTimeout, onClose, visible]);

  const handleClose = () => {
    console.log('Manually closing notification');
    setVisible(false);
    if (onClose) onClose();
  };

  // Fixed div for anchoring notifications
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '10px', 
    height: '10px',
    zIndex: 9999,
  };

  console.log('Anchor ref exists:', !!anchorRef.current);

  return (
    <div ref={anchorRef} style={positionStyles}>
      <Popup anchor={anchorRef.current} anchorAlign={getPosition()} popupAlign={getPosition()} appendTo={document.body}>
        {visible && (
          <Fade>
            <NotificationGroup style={{ maxWidth: '400px' }}>
              <KendoNotification
                type={{ style: type, icon: true }}
                closable={true}
                onClose={handleClose}
                style={{ margin: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}
              >
                <div style={{ padding: '5px' }}>{message}</div>
              </KendoNotification>
            </NotificationGroup>
          </Fade>
        )}
      </Popup>
    </div>
  );
};

export default Notification; 