"use client";

import React, { useState } from 'react';
import { Button } from '@/components/kendo/free';
import { 
  Notification as KendoNotification,
  NotificationGroup
} from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';

const DirectNotificationTest: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const showDirectNotification = () => {
    setVisible(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  return (
    <div className="p-4 mt-4 space-y-4 border-t border-gray-300">
      <h2 className="text-xl font-bold">Direct KendoReact Notification Test</h2>
      <p className="text-sm text-gray-600">
        This is a direct test using KendoReact Notification component with minimal wrappers
      </p>
      
      <Button 
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
        onClick={showDirectNotification}
      >
        Show Direct KendoReact Notification
      </Button>
      
      {visible && (
        <div 
          style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
          className="k-notification-container"
        >
          <Fade>
            <NotificationGroup>
              <KendoNotification
                type={{ style: 'info', icon: true }}
                closable={true}
                onClose={() => setVisible(false)}
                className="k-notification-info"
              >
                <div className="k-notification-content">
                  <strong>Bottom Center!</strong> This notification appears at the bottom center of the screen.
                </div>
              </KendoNotification>
            </NotificationGroup>
          </Fade>
        </div>
      )}
    </div>
  );
};

export default DirectNotificationTest; 