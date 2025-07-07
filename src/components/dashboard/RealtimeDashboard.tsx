import React from 'react';
import { useSimpleRealtime } from '@/hooks/useSimpleRealtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';

interface RealtimeDashboardProps {
  businessId: string;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({ 
  businessId 
}) => {
  const { 
    isConnected, 
    connectionError, 
    reconnect 
  } = useSimpleRealtime(businessId);
  
  // For more detailed connection status
  const { connectionStatus } = useDashboardRealtime(businessId);
  
  const [isReconnecting, setIsReconnecting] = React.useState(false);
  
  // Calculate number of active connections
  const activeConnections = React.useMemo(() => {
    if (!connectionStatus) return 0;
    return Object.values(connectionStatus).filter(Boolean).length;
  }, [connectionStatus]);
  
  // Calculate total number of possible connections
  const totalConnections = React.useMemo(() => {
    if (!connectionStatus) return 1;
    return Object.values(connectionStatus).length;
  }, [connectionStatus]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    await reconnect();
    setTimeout(() => setIsReconnecting(false), 1000);
  };

  return (
    <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Realtime Updates</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 gap-1 flex items-center border-green-100">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected ({activeConnections}/{totalConnections})
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 gap-1 flex items-center border-red-100">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Disconnected
                </Badge>
              )}
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={isReconnecting && isConnected}
              className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
              {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
            </Button>
          </div>
        </div>
        
        {connectionError && (
          <div className="p-3 mt-2 text-sm bg-red-50 border border-red-100 rounded-md text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{connectionError}</p>
          </div>
        )}
        
        {isConnected && !connectionError && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p>All systems operational - you'll receive real-time updates for bookings, payments, and client activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
