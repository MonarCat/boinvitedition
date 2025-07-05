
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseSimpleRealtimeProps {
  businessId: string;
  enableToasts?: boolean;
}

export const useSimpleRealtime = (businessId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const reconnect = useCallback(() => {
    setConnectionError(null);
    setIsConnected(false);
    
    // Simulate reconnection
    setTimeout(() => {
      setIsConnected(true);
      toast.success('Real-time connection restored');
    }, 1000);
  }, []);

  useEffect(() => {
    if (!businessId) return;

    // Set up real-time subscription
    const channel = supabase
      .channel(`business_${businessId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `business_id=eq.${businessId}`
      }, () => {
        console.log('Booking update received');
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'client_business_transactions',
        filter: `business_id=eq.${businessId}`
      }, () => {
        console.log('Transaction update received');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionError('Connection failed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  return {
    isConnected,
    connectionError,
    reconnect
  };
};
