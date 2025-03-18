"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/kendo/free';
import { useNotifications } from '@/utils/notificationService';

const NotificationDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotifications();

  const toggleDebugger = () => {
    setIsOpen(!isOpen);
  };

  const showStaticNotifications = () => {
    // Show one notification of each type in different positions
    notifications.success('This is a static success notification', { 
      position: 'top-start',
      autoClose: false 
    });
    
    notifications.info('This is a static info notification', { 
      position: 'top-end',
      autoClose: false 
    });
    
    notifications.warning('This is a static warning notification', { 
      position: 'bottom-start',
      autoClose: false 
    });
    
    notifications.error('This is a static error notification', { 
      position: 'bottom-end',
      autoClose: false 
    });
  };

  return (
    <>
      <button 
        onClick={toggleDebugger}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded shadow-lg z-50"
      >
        {isOpen ? 'Close Debug' : 'Debug Notifications'}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Notification Debugger</h2>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Show Test Notifications</h3>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => notifications.success('Success test notification')}>
                    Success
                  </Button>
                  <Button onClick={() => notifications.info('Info test notification')}>
                    Info
                  </Button>
                  <Button onClick={() => notifications.warning('Warning test notification')}>
                    Warning
                  </Button>
                  <Button onClick={() => notifications.error('Error test notification')}>
                    Error
                  </Button>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Static Notifications</h3>
                <Button onClick={showStaticNotifications} className="k-button k-button-md k-rounded-md k-button-solid">
                  Show All Static Notifications
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  This will show non-auto-closing notifications at all four corners
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">CSS Debugging</h3>
                <div className="p-3 bg-gray-100 rounded">
                  <pre className="text-xs overflow-auto">
                    {`.k-notification-container {
  position: fixed;
  z-index: 9999;
  padding: 10px;
}

.k-notification {
  width: 350px;
  border-left-width: 6px;
  background-color: white;
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={toggleDebugger} className="k-button-solid-base">
                Close Debugger
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDebugger; 