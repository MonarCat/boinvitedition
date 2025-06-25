
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, Upload, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OfflineData {
  id: string;
  type: 'booking' | 'service' | 'client';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - syncing data...');
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data from localStorage
    loadPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingData = () => {
    try {
      const stored = localStorage.getItem('boinvit_offline_data');
      if (stored) {
        setPendingData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const savePendingData = (data: OfflineData[]) => {
    try {
      localStorage.setItem('boinvit_offline_data', JSON.stringify(data));
      setPendingData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const addOfflineData = (type: OfflineData['type'], data: any) => {
    const newItem: OfflineData = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const updated = [...pendingData, newItem];
    savePendingData(updated);
    
    toast.info('Data saved offline - will sync when connection is restored');
  };

  const syncPendingData = async () => {
    if (!isOnline || syncing || pendingData.length === 0) return;

    setSyncing(true);
    
    try {
      for (const item of pendingData.filter(d => !d.synced)) {
        // Here you would implement actual sync logic
        // For now, we'll simulate successful sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updated = pendingData.map(d => 
          d.id === item.id ? { ...d, synced: true } : d
        );
        savePendingData(updated);
      }
      
      // Remove synced items after 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const filtered = pendingData.filter(d => 
        !d.synced || d.timestamp > oneDayAgo
      );
      savePendingData(filtered);
      
      toast.success('All data synced successfully');
    } catch (error) {
      toast.error('Some data failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  const unsyncedCount = pendingData.filter(d => !d.synced).length;

  if (isOnline && unsyncedCount === 0) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 lg:hidden shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <WifiOff className="w-5 h-5 text-red-500" />
            ) : syncing ? (
              <Upload className="w-5 h-5 text-blue-500 animate-pulse" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            
            <div>
              <p className="text-sm font-medium">
                {!isOnline ? 'Working Offline' : syncing ? 'Syncing...' : 'Sync Complete'}
              </p>
              {unsyncedCount > 0 && (
                <p className="text-xs text-gray-600">
                  {unsyncedCount} items pending sync
                </p>
              )}
            </div>
          </div>

          {isOnline && unsyncedCount > 0 && !syncing && (
            <Button size="sm" onClick={syncPendingData}>
              Sync Now
            </Button>
          )}
        </div>

        {pendingData.length > 0 && (
          <div className="mt-3 space-y-1">
            {pendingData.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span className="capitalize">{item.type}</span>
                <span>•</span>
                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                {item.synced && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
              </div>
            ))}
            {pendingData.length > 3 && (
              <p className="text-xs text-gray-500">
                +{pendingData.length - 3} more items
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export the addOfflineData function for use in other components
export const useOfflineManager = () => {
  const addOfflineData = (type: OfflineData['type'], data: any) => {
    // This would be implemented to work with the OfflineManager component
    console.log('Adding offline data:', type, data);
  };

  return { addOfflineData };
};
