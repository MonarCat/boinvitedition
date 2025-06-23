
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { getPendingAttendanceCount, syncOfflineAttendance } from '@/lib/offlineAttendance';

export const OfflineAttendanceIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updatePendingCount = () => setPendingCount(getPendingAttendanceCount());

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Update pending count periodically
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 1000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncOfflineAttendance();
      setPendingCount(getPendingAttendanceCount());
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? 'default' : 'destructive'}>
        {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      
      {pendingCount > 0 && (
        <>
          <Badge variant="outline">
            {pendingCount} pending
          </Badge>
          
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </>
      )}
    </div>
  );
};
