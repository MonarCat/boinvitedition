import React from 'react';

interface UpdateNotificationProps {
  version?: string;
}

/**
 * UpdateNotification - Component for displaying update notifications
 * This component is currently disabled to prevent annoying users with update prompts
 * Updates will occur naturally when users refresh the page or restart the app
 */
export const UpdateNotification: React.FC<UpdateNotificationProps> = () => {
  // Return null to completely hide the update notification
  return null;
}
};
