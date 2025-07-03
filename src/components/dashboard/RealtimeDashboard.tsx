import React from 'react';
import { useSimpleRealtime } from '@/hooks/useSimpleRealtime';
import { Button } from '@/components/ui/button';

interface RealtimeDashboardProps {
  businessId: string;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({ 
  businessId 
}) => {
  const { 
    isConnected, 
    error, 
    forceReconnect 
  } = useSimpleRealtime({
    businessId,
    tables: {
      bookings: true,
      payments: true,
      clients: true,
      staff: true
    },
    showToasts: true
  });

  return (
    <div className="p-4 bg-white rounded-md shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Realtime Updates</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          {isConnected ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
              Disconnected
            </span>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-3 mb-4 text-sm bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <p>Connection issue: {error}</p>
        </div>
      )}
      
      <div className="text-sm mb-4">
        <p>Real-time updates will appear automatically for:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>New bookings</li>
          <li>New payments</li>
          <li>New clients</li>
          <li>Staff changes</li>
        </ul>
      </div>
      
      <Button 
        onClick={forceReconnect}
        variant="outline"
        className="w-full"
        disabled={isConnected && !error}
      >
        Reconnect
      </Button>
    </div>
  );
};
