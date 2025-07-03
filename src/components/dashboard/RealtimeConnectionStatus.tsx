import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface RealtimeStatus {
  bookings: boolean;
  payments: boolean;
  clientTransactions: boolean;
  clients: boolean;
  staff: boolean;
  staffAttendance: boolean;
  adminAlerts: boolean;
}

interface RealtimeConnectionStatusProps {
  connectionStatus: RealtimeStatus;
  connectionError: string | null;
  onReconnect?: () => void;
}

export const RealtimeConnectionStatus: React.FC<RealtimeConnectionStatusProps> = ({
  connectionStatus,
  connectionError,
  onReconnect
}) => {
  const connectedCount = Object.values(connectionStatus).filter(Boolean).length;
  const totalConnections = Object.values(connectionStatus).length;
  const isFullyConnected = connectedCount === totalConnections;
  const isPartiallyConnected = connectedCount > 0 && connectedCount < totalConnections;
  const isDisconnected = connectedCount === 0;

  let statusColor = 'bg-green-500';
  if (isPartiallyConnected) statusColor = 'bg-yellow-500';
  if (isDisconnected) statusColor = 'bg-red-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {isFullyConnected && <Wifi className="w-4 h-4 text-green-500" />}
            {isPartiallyConnected && <Wifi className="w-4 h-4 text-yellow-500" />}
            {isDisconnected && <WifiOff className="w-4 h-4 text-red-500" />}
            
            <Badge variant="outline" className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-1.5 ${statusColor}`} />
              {isFullyConnected && 'Real-time Connected'}
              {isPartiallyConnected && 'Partially Connected'}
              {isDisconnected && 'Disconnected'}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <p className="font-bold">Real-time Connection Status</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Bookings:</span>
                <span className={connectionStatus.bookings ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.bookings ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payments:</span>
                <span className={connectionStatus.payments ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.payments ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transactions:</span>
                <span className={connectionStatus.clientTransactions ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.clientTransactions ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clients:</span>
                <span className={connectionStatus.clients ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.clients ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Staff:</span>
                <span className={connectionStatus.staff ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.staff ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attendance:</span>
                <span className={connectionStatus.staffAttendance ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.staffAttendance ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Alerts:</span>
                <span className={connectionStatus.adminAlerts ? 'text-green-500' : 'text-red-500'}>
                  {connectionStatus.adminAlerts ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {connectionError && (
              <div className="text-xs text-red-500 mt-1">
                Error: {connectionError}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              {isFullyConnected 
                ? 'All real-time updates are working correctly.' 
                : 'Some real-time updates may be delayed.'}
            </p>
            
            {onReconnect && (isPartiallyConnected || isDisconnected) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 text-xs flex items-center justify-center" 
                onClick={(e) => {
                  e.stopPropagation();
                  onReconnect();
                }}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Reconnect
              </Button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
