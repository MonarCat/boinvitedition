
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
}

export const EnhancedPWAManager = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasNotificationPermission: false,
    canInstall: false,
    updateAvailable: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if PWA is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isAppInstalled = (window.navigator as any).standalone === true;
      return isStandalone || isAppInstalled;
    };

    // Check notification permission
    const checkNotificationPermission = () => {
      return 'Notification' in window && Notification.permission === 'granted';
    };

    // Update state
    setPwaState(prev => ({
      ...prev,
      isInstalled: checkInstalled(),
      hasNotificationPermission: checkNotificationPermission()
    }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaState(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for network changes
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setPwaState(prev => ({ ...prev, updateAvailable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setPwaState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
    }
    
    setDeferredPrompt(null);
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPwaState(prev => ({ ...prev, hasNotificationPermission: true }));
      toast.success('Notifications enabled!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
          window.location.reload();
        }
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* PWA Status */}
      <div className="flex items-center gap-2">
        {pwaState.isInstalled && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            PWA
          </Badge>
        )}
        
        <Badge 
          variant={pwaState.isOnline ? "default" : "destructive"}
          className="text-xs flex items-center gap-1"
        >
          {pwaState.isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Offline
            </>
          )}
        </Badge>
        
        {pwaState.hasNotificationPermission && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Notifications
          </Badge>
        )}
      </div>

      {/* Install Prompt */}
      {pwaState.canInstall && !pwaState.isInstalled && (
        <Card className="w-72 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Install Boinvit App</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Get the full app experience with offline access and notifications.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Install
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPwaState(prev => ({ ...prev, canInstall: false }))}
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Permission */}
      {pwaState.isInstalled && !pwaState.hasNotificationPermission && (
        <Card className="w-72 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BellOff className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-sm">Enable Notifications</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Get notified about booking confirmations and updates.
            </p>
            <Button onClick={handleNotificationPermission} size="sm" className="w-full">
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Update Available */}
      {pwaState.updateAvailable && (
        <Card className="w-72 shadow-lg border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Update Available</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              A new version of the app is available with improvements and bug fixes.
            </p>
            <Button onClick={handleUpdate} size="sm" className="w-full">
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
