import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { shouldShowUpdatePrompt, dismissUpdatePrompt } from '@/utils/dismissUpdatePrompt';

interface UpdateNotificationProps {
  version?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  version = '1.0.0'
}) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Only show if we should based on user preferences
    const checkUpdatePrompt = () => {
      if (shouldShowUpdatePrompt(version)) {
        setShowNotification(true);
      }
    };

    // Register listener for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        checkUpdatePrompt();
      });
    }

    // Initial check (for existing updates)
    checkUpdatePrompt();
  }, [version]);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
          window.location.reload();
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  const handleDismiss = (permanently: boolean = false) => {
    dismissUpdatePrompt(version, permanently);
    setShowNotification(false);
    toast.info('You can update later from settings');
  };

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-white">
        <CardContent className="p-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(false)}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
            
          <div className="flex items-center gap-2 mb-3 pt-1">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm">Update Available</h3>
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            A new version is available with improvements and bug fixes.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Update Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDismiss(true)} 
              className="flex-1"
              size="sm"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
