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
    if (!businessId) {
      console.log('❌ useBookingsRealtime: No businessId provided');
      return;
    }

    console.log('🔄 Setting up enhanced real-time booking listeners for business:', businessId);

    // Listen to booking changes
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
          console.log('🎯 BOOKING CHANGE DETECTED - Real-time update triggered!', {
            business_id: businessId,
            booking_id: bookingPayload.new?.id,
            payload: bookingPayload
          });
          
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
          }
          
          console.log('✅ All booking queries invalidated for business:', businessId);
        }
      )
      .subscribe((status) => {
        console.log('📡 Booking channel subscription status:', status);
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
          console.log('💳 PAYMENT CHANGE DETECTED - Real-time update triggered!', {
            business_id: businessId,
            payment_id: paymentPayload.new?.id,
            booking_id: paymentPayload.new?.booking_id,
            payload: paymentPayload
          });
          
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
          
          console.log('✅ All payment queries invalidated for business:', businessId);
        }
      )
      .subscribe((status) => {
        console.log('📡 Payment channel subscription status:', status);
      });

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
          console.log('👥 CLIENT CHANGE DETECTED - Real-time update triggered!', {
            business_id: businessId,
            payload: payload
          });
          
          // Invalidate client-related queries
          queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
          
          console.log('✅ All client queries invalidated for business:', businessId);
        }
      )
      .subscribe((status) => {
        console.log('📡 Client channel subscription status:', status);
      });

    console.log('🚀 All real-time channels subscribed for business:', businessId);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up booking real-time listeners for business:', businessId);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(clientChannel);
      console.log('✅ All channels cleaned up');
    };
  }, [businessId, queryClient]);
};
