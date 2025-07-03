import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to specifically monitor client payments
 * This hook will listen to both payment_transactions and payments tables
 */
export const useClientPaymentMonitor = (businessId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('🔄 Setting up payment monitoring for business:', businessId);
    
    // Create channels for both payment tables
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

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up client payment monitoring');
      supabase.removeChannel(paymentTransactionsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [businessId, queryClient]);
};
