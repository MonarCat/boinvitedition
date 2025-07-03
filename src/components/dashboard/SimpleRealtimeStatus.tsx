import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SimpleRealtimeStatusProps {
  isConnected: boolean;
  connectionError: string | null;
  onReconnect?: () => void;
}

export const SimpleRealtimeStatus: React.FC<SimpleRealtimeStatusProps> = ({
  isConnected,
  connectionError,
  onReconnect
}) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {isConnected ? (
                <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                  <Wifi size={14} className="text-green-600" />
                  <span>Connected</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200">
                  <WifiOff size={14} className="text-red-600" />
                  <span>Disconnected</span>
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="p-2 max-w-xs">
              <h4 className="font-medium mb-2">Realtime Status</h4>
              {isConnected ? (
                <p className="text-sm text-green-600">Your dashboard is receiving real-time updates.</p>
              ) : (
                <p className="text-sm text-red-600">
                  {connectionError || "Your dashboard is not receiving real-time updates."}
                </p>
              )}
              {!isConnected && onReconnect && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={onReconnect}
                >
                  <RefreshCw size={14} className="mr-1" />
                  Reconnect
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onReconnect && !isConnected && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReconnect} 
          className="h-7 px-2"
        >
          <RefreshCw size={14} />
        </Button>
      )}
    </div>
  );
};
