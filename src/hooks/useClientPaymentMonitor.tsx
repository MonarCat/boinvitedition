import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to monitor client payments and bookings
 * This hook will listen to payment_transactions, payments, and bookings tables
 * to ensure dashboard stats are always up-to-date
 */
export const useClientPaymentMonitor = (businessId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('🔄 Setting up payment and booking monitoring for business:', businessId);
    
    // Create channels for payment tables
    const paymentTransactionsChannel = supabase
      .channel('client-payment-transactions-' + businessId)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('💰 CLIENT: Payment transaction change detected:', payload);
          
          // Invalidate relevant queries for client payments
          queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
          queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
          
          // Also invalidate dashboard stats
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          
          // Show toast notification for new payments
          if (payload.eventType === 'INSERT') {
            toast.success('Payment transaction updated', {
              description: 'Your payment has been processed.',
              duration: 5000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('CLIENT: Payment transactions subscription status:', status);
      });
    
    // Also listen to the payments table
    const paymentsChannel = supabase
      .channel('client-payments-table-' + businessId)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('💳 CLIENT: Payments table change detected:', payload);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
          queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
          
          // Also invalidate dashboard stats
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          
          // Show toast notification for payment updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            toast.success('Payment updated', {
              description: 'Your payment information has been updated.',
              duration: 5000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('CLIENT: Payments table subscription status:', status);
      });
      
    // Add a channel for tracking bookings
    const bookingsChannel = supabase
      .channel('client-bookings-' + businessId)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('📅 CLIENT: Booking change detected:', payload);
          
          // Explicitly invalidate dashboard stats on booking changes
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
          queryClient.invalidateQueries({ queryKey: ['bookings-list', businessId] });
          
          // Show toast notification for new bookings
          if (payload.eventType === 'INSERT') {
            toast.success('Booking created', {
              description: 'Your booking has been confirmed.',
              duration: 5000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('CLIENT: Bookings subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up client payment and booking monitoring');
      supabase.removeChannel(paymentTransactionsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [businessId, queryClient]);
};
