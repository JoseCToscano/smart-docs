"use client";

import React, { useState } from 'react';
import { Button } from '@/components/kendo/free';
import { useNotifications } from '@/utils/notificationService';
import Notification from '@/components/kendo/free/Notification';

const NotificationDemo: React.FC = () => {
  const notifications = useNotifications();
  const [directNotification, setDirectNotification] = useState<{ visible: boolean, message: string } | null>(null);

  const showSuccessNotification = () => {
    console.log('Clicked success notification button');
    notifications.success('Operation completed successfully!');
  };

  const showInfoNotification = () => {
    console.log('Clicked info notification button');
    notifications.info('This is an informational message.');
  };

  const showWarningNotification = () => {
    console.log('Clicked warning notification button');
    notifications.warning('Warning: This action may have consequences.');
  };

  const showErrorNotification = () => {
    console.log('Clicked error notification button');
    notifications.error('An error occurred while processing your request.');
  };

  const showCustomPositionNotification = () => {
    console.log('Clicked custom position notification button');
    notifications.info('This notification appears at the bottom center.', {
      position: 'bottom-center',
      autoCloseTimeout: 8000,
    });
  };

  const showDirectNotification = () => {
    console.log('Showing direct notification as a test');
    setDirectNotification({
      visible: true,
      message: 'This is a direct notification bypassing the service'
    });
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Notification Demo</h2>
        <div className="space-x-2 flex flex-wrap gap-2">
          <Button themeColor="success" onClick={showSuccessNotification}>
            Success Notification
          </Button>
          <Button themeColor="info" onClick={showInfoNotification}>
            Info Notification
          </Button>
          <Button themeColor="warning" onClick={showWarningNotification}>
            Warning Notification
          </Button>
          <Button themeColor="error" onClick={showErrorNotification}>
            Error Notification
          </Button>
          <Button onClick={showCustomPositionNotification}>
            Custom Position Notification
          </Button>
          <Button onClick={showDirectNotification} themeColor="dark">
            Direct Test Notification
          </Button>
        </div>
        <div className="mt-4 p-2 border border-gray-200 rounded">
          <p className="text-sm">Check the browser console for debugging information</p>
        </div>
      </div>
      
      {directNotification && directNotification.visible && (
        <Notification 
          message={directNotification.message}
          type="info"
          position="top-center"
          autoClose={true}
          autoCloseTimeout={5000}
          onClose={() => setDirectNotification(null)}
        />
      )}
    </>
  );
};

export default NotificationDemo; 