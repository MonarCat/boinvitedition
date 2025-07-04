
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useCompleteRealtime } from '@/hooks/useCompleteRealtime';

interface EnhancedRealtimeStatusProps {
  businessId: string;
}

export const EnhancedRealtimeStatus: React.FC<EnhancedRealtimeStatusProps> = ({ businessId }) => {
  const { 
    connectionStatus, 
    connectionError, 
    isFullyConnected, 
    connectedCount, 
    totalConnections,
    lastUpdate,
    forceReconnect 
  } = useCompleteRealtime({ businessId, enableToasts: true });

  const getStatusIcon = () => {
    if (isFullyConnected) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (connectedCount > 0) return <Wifi className="w-5 h-5 text-yellow-500" />;
    return <WifiOff className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isFullyConnected) return 'bg-green-100 text-green-800 border-green-200';
    if (connectedCount > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = () => {
    if (isFullyConnected) return 'All Systems Connected';
    if (connectedCount > 0) return `Partially Connected (${connectedCount}/${totalConnections})`;
    return 'Disconnected';
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>Real-Time Status</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status Grid */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(connectionStatus).map(([key, connected]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              {connected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          ))}
        </div>

        {/* Last Update Info */}
        <div className="text-xs text-gray-500 text-center">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>

        {/* Error Display */}
        {connectionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Connection Error:</strong> {connectionError}
          </div>
        )}

        {/* Reconnect Button */}
        {!isFullyConnected && (
          <Button 
            onClick={forceReconnect} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reconnect All
          </Button>
        )}

        {/* Status Description */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
          {isFullyConnected ? (
            "✅ Your dashboard is receiving real-time updates for all data sources."
          ) : (
            "⚠️ Some real-time connections are down. Updates may be delayed."
          )}
        </div>
      </CardContent>
    </Card>
  );
};
