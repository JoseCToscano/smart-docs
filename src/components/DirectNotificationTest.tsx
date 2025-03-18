"use client";

import React, { useState } from 'react';
import { Button } from '@/components/kendo/free';
import { 
  Notification as KendoNotification,
  NotificationGroup
} from '@progress/kendo-react-notification';

const DirectNotificationTest: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const showDirectNotification = () => {
    console.log('Showing direct KendoNotification');
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
      
      <Button onClick={showDirectNotification} themeColor="dark">
        Show Direct KendoReact Notification
      </Button>
      
      {visible && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          <NotificationGroup style={{ maxWidth: '400px' }}>
            <KendoNotification
              type={{ style: 'info', icon: true }}
              closable={true}
              onClose={() => setVisible(false)}
            >
              <div style={{ padding: '10px' }}>
                This is a direct KendoReact notification without any custom wrappers
              </div>
            </KendoNotification>
          </NotificationGroup>
        </div>
      )}
    </div>
  );
};

export default DirectNotificationTest; 