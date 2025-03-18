"use client";

import React, { useState } from 'react';
import { Button } from '@/components/kendo/free';
import { useNotifications } from '@/utils/notificationService';
import { Notification } from '@/components/kendo/free/Notification';

const NotificationDemo: React.FC = () => {
  const notifications = useNotifications();
  const [directNotification, setDirectNotification] = useState<{ visible: boolean, message: string } | null>(null);

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
    });
  };

  const showDirectNotification = () => {
    setDirectNotification({
      visible: true,
      message: 'This is a direct notification bypassing the service'
    });
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Notification Demo</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-success" 
            onClick={showSuccessNotification}
          >
            Success Notification
          </Button>
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-info" 
            onClick={showInfoNotification}
          >
            Info Notification
          </Button>
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-warning" 
            onClick={showWarningNotification}
          >
            Warning Notification
          </Button>
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-error" 
            onClick={showErrorNotification}
          >
            Error Notification
          </Button>
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid" 
            onClick={showCustomPositionNotification}
          >
            Custom Position Notification
          </Button>
          <Button 
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" 
            onClick={showDirectNotification}
          >
            Direct Test Notification
          </Button>
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