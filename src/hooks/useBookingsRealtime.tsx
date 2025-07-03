import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type BookingPayload = {
  new: {
    id?: string;
    status?: string;
    payment_status?: string;
    business_id?: string;
    [key: string]: unknown;
  };
  old: Record<string, unknown>;
};

type PaymentPayload = {
  new: {
    id?: string;
    booking_id?: string;
    business_id?: string;
    status?: string;
    [key: string]: unknown;
  };
  old: Record<string, unknown>;
};

/**
 * Hook to subscribe to real-time booking updates for a business
 * This ensures that when clients confirm bookings, they show immediately on the business side
 */
export const useBookingsRealtime = (businessId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('Setting up real-time bookings listener for business:', businessId);

    // Listen to booking changes with detailed logging
    const bookingChannel = supabase
      .channel(`business-bookings-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload: BookingPayload) => {
          const bookingPayload = payload as BookingPayload;
          console.log('Booking change detected in real-time:', bookingPayload);
          
          // Invalidate all booking-related queries with businessId
          queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
          queryClient.invalidateQueries({ queryKey: ['bookings-list', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
          queryClient.invalidateQueries({ queryKey: ['clients', businessId] }); // Add clients invalidation
          
          // Invalidate specific booking if we have its ID
          if (bookingPayload.new && bookingPayload.new.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['booking', bookingPayload.new.id]
            });
            
            // Log confirmed/completed bookings
            if (
              bookingPayload.new.status === 'confirmed' || 
              bookingPayload.new.status === 'completed' ||
              bookingPayload.new.payment_status === 'completed'
            ) {
              console.log('New confirmed/completed booking detected:', bookingPayload.new);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Booking channel subscription status:', status);
      });

    // Listen to payment transaction changes
    const paymentChannel = supabase
      .channel(`business-payments-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload: PaymentPayload) => {
          const paymentPayload = payload as PaymentPayload;
          console.log('Payment transaction change detected in real-time:', paymentPayload);
          
          // Invalidate payment and financial related queries with businessId
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
          queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
          
          // If the payment is associated with a booking, also invalidate booking queries
          if (paymentPayload.new && paymentPayload.new.booking_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['bookings', businessId] 
            });
            queryClient.invalidateQueries({ 
              queryKey: ['booking', paymentPayload.new.booking_id]
            });
          }
        }
      )
      .subscribe();

    // Listen to client changes (when new clients are created during booking)
    const clientChannel = supabase
      .channel(`business-clients-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Client change detected in real-time:', payload);
          
          // Invalidate client-related queries
          queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up booking real-time listeners');
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(clientChannel);
    };
  }, [businessId, queryClient]);
};
