import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardRealtime = (businessId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('Setting up real-time dashboard listeners for business:', businessId);

    // Listen to booking changes
    const bookingChannel = supabase
      .channel('dashboard-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          // Invalidate dashboard stats to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe();

    // Listen to payment transaction changes
    const paymentChannel = supabase
      .channel('dashboard-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Payment transaction change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe();

    // Listen to client transaction changes
    const clientTransactionChannel = supabase
      .channel('dashboard-client-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_business_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Client transaction change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe();

    // Listen to client changes
    const clientChannel = supabase
      .channel('dashboard-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Client change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up dashboard real-time listeners');
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(clientTransactionChannel);
      supabase.removeChannel(clientChannel);
    };
  }, [businessId, queryClient]);
};