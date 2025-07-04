import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleRealtime = (businessId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [latestEvents, setLatestEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!businessId) return;

    // Subscribe to changes in bookings for this business
    const bookingSubscription = supabase
      .channel('bookings-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          setLatestEvents((prev) => [
            { type: 'booking', data: payload.new, event: payload.eventType, timestamp: new Date() },
            ...prev,
          ].slice(0, 10));
          setIsConnected(true);
          setConnectionError(null);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionError('Failed to connect to realtime updates');
        }
      });

    // Subscribe to changes in payments for this business
    const paymentSubscription = supabase
      .channel('payments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          setLatestEvents((prev) => [
            { type: 'payment', data: payload.new, event: payload.eventType, timestamp: new Date() },
            ...prev,
          ].slice(0, 10));
          setIsConnected(true);
          setConnectionError(null);
        }
      )
      .subscribe();

    return () => {
      bookingSubscription.unsubscribe();
      paymentSubscription.unsubscribe();
    };
  }, [businessId]);

  const reconnect = () => {
    // Reconnect logic
    supabase.removeAllChannels();
    setIsConnected(false);
    setConnectionError('Reconnecting...');
    
    // The channels will be recreated on the next render due to the useEffect dependency
    // Force a re-render by updating the state
    setLatestEvents([]);
  };

  return {
    isConnected,
    connectionError,
    latestEvents,
    reconnect
  };
};
