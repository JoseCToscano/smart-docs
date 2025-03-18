"use client";

import React from 'react';
import { Button } from '@/components/kendo/free';
import { useNotifications } from '@/utils/notificationService';

const NotificationDemo: React.FC = () => {
  const notifications = useNotifications();

  const showSuccessNotification = () => {
    notifications.success('Operation completed successfully!');
  };

  const showInfoNotification = () => {
    notifications.info('This is an informational message.');
  };

  const showWarningNotification = () => {
    notifications.warning('Warning: This action may have consequences.');
  };

  const showErrorNotification = () => {
    notifications.error('An error occurred while processing your request.');
  };

  const showCustomPositionNotification = () => {
    notifications.info('This notification appears at the bottom center.', {
      position: 'bottom-center',
      autoCloseTimeout: 8000,
    });
  };

  return (
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
      </div>
    </div>
  );
};

export default NotificationDemo; 