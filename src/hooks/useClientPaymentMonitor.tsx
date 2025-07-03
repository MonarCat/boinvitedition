import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { safeSupabaseOperation } from '@/utils/connectionHealth';
import { enhancedRealtimeManager } from '@/services/EnhancedRealtimeManager';
import type { ChannelStatus } from '@/services/EnhancedRealtimeManager';
import { runComprehensiveRealtimeTest } from '@/utils/realtimeChannelTest';

/**
 * Hook to monitor client payments and bookings
 * This hook will listen to payment_transactions, payments, and bookings tables
 * to ensure dashboard stats are always up-to-date
 * 
 * Updated to use the EnhancedRealtimeManager for more reliable connections
 */
export const useClientPaymentMonitor = (businessId: string) => {
  const queryClient = useQueryClient();
  const [connectionErrors, setConnectionErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!businessId) return;

    console.log('🔄 Setting up payment and booking monitoring for business:', businessId);
    
    // Run a test to verify all required channels are present
    runComprehensiveRealtimeTest(businessId).then(result => {
      console.log('Real-time channel test complete:', result);
      
      // Show warnings if any channels are missing
      if (!result.connectionWorking || result.summary.missingChannels.length > 0) {
        console.warn('⚠️ Some real-time channels may not be functioning correctly!');
      }
    });
    
    // Track subscription IDs for cleanup
    const subscriptionIds: string[] = [];
    
    // Helper for handling connection status
    const handleChannelStatus = (channelName: string, status: ChannelStatus) => {
      console.log(`${channelName} subscription status:`, status);
      
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnectionErrors(prev => ({ ...prev, [channelName]: true }));
        console.error(`❌ Error with ${channelName} channel`);
      } else if (status === 'SUBSCRIBED') {
        setConnectionErrors(prev => ({ ...prev, [channelName]: false }));
      }
    };

    // Subscribe to payment transactions using EnhancedRealtimeManager
    const setupPaymentTransactionsSubscription = () => {
      const subscriptionId = enhancedRealtimeManager.subscribe(
        { 
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('💰 CLIENT: Payment transaction change detected:', payload);
              
          // Show toast notification for new payments
          if (payload.eventType === 'INSERT') {
            toast.success('Payment transaction updated', {
              description: 'Your payment has been processed.',
              duration: 5000
            });
          }
          
          // Directly trigger business dashboard stats invalidation
          // This ensures business dashboard immediately sees the payment
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-revenue', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
        },
        (status) => handleChannelStatus('payment-transactions', status),
        // Automatically invalidate these queries on any event
        [
          ['client-payments', businessId],
          ['payment-transactions', businessId],
          ['dashboard-stats', businessId]
        ]
      );
      
      subscriptionIds.push(subscriptionId);
    };
    
    // Subscribe to payments using EnhancedRealtimeManager
    const setupPaymentsSubscription = () => {
      const subscriptionId = enhancedRealtimeManager.subscribe(
        { 
          table: 'payments',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('💳 CLIENT: Payments table change detected:', payload);
              
          // Show more detailed toast notification for payment updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const status = payload.new?.status || 'updated';
            let toastMessage = 'Payment updated';
            let description = 'Your payment information has been updated.';
            let duration = 5000;
            
            // Provide more specific message based on status
            if (status === 'completed' || status === 'success' || status === 'paid') {
              toastMessage = 'Payment successful!';
              description = 'Your payment has been successfully processed.';
              duration = 8000;
              
              // Ensure dashboard is updated immediately on successful payment
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId], exact: false });
              queryClient.invalidateQueries({ queryKey: ['business-revenue', businessId], exact: false });
              queryClient.invalidateQueries({ queryKey: ['business-data', businessId], exact: false });
              
            } else if (status === 'failed') {
              toastMessage = 'Payment failed';
              description = 'There was a problem with your payment. Please try again.';
              duration = 8000;
            } else if (status === 'pending') {
              toastMessage = 'Payment pending';
              description = 'Your payment is being processed. Please wait.';
            }
            
            toast.success(toastMessage, {
              description: description,
              duration: duration
            });
          }
          
          // Always trigger business dashboard stats invalidation
          // This ensures business dashboard immediately sees the payment
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
        },
        (status) => handleChannelStatus('payments-table', status),
        // Automatically invalidate these queries on any event
        [
          ['client-payments', businessId],
          ['payments', businessId],
          ['payment-transactions', businessId],
          ['client-business-transactions', businessId],
          ['dashboard-stats', businessId]
        ]
      );
      
      subscriptionIds.push(subscriptionId);
    };
    
    // Subscribe to bookings using EnhancedRealtimeManager
    const setupBookingsSubscription = () => {
      const subscriptionId = enhancedRealtimeManager.subscribe(
        { 
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('📅 CLIENT: Booking change detected:', payload);
              
          // Show toast notification for new bookings
          if (payload.eventType === 'INSERT') {
            toast.success('Booking created', {
              description: 'Your booking has been confirmed.',
              duration: 5000
            });
          }
        },
        (status) => handleChannelStatus('bookings', status),
        // Automatically invalidate these queries on any event
        [
          ['dashboard-stats', businessId],
          ['bookings', businessId],
          ['bookings-list', businessId]
        ]
      );
      
      subscriptionIds.push(subscriptionId);
    };

    // Subscribe to client_business_transactions using EnhancedRealtimeManager
    const setupClientBusinessTransactionsSubscription = () => {
      const subscriptionId = enhancedRealtimeManager.subscribe(
        { 
          table: 'client_business_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('💰 CLIENT: Business transaction change detected:', payload);
              
          // Show toast notification for transaction updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const status = payload.new?.status || 'updated';
            let toastMessage = 'Payment transaction updated';
            let description = 'Your transaction details have been updated.';
            
            // Provide more specific message based on status
            if (status === 'completed') {
              toastMessage = 'Transaction completed!';
              description = 'Your payment transaction has been successfully processed.';
              
              // Critical: Ensure business dashboard is immediately updated with this new transaction
              // This is especially important as client_business_transactions is the primary source
              // of financial data for the dashboard
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId], exact: false });
              queryClient.invalidateQueries({ queryKey: ['business-revenue', businessId], exact: false });
              queryClient.invalidateQueries({ queryKey: ['business-data', businessId], exact: false });
              queryClient.invalidateQueries({ queryKey: ['transactions', businessId], exact: false });
              
            } else if (status === 'failed') {
              toastMessage = 'Transaction failed';
              description = 'There was a problem with your transaction. Please try again.';
            }
            
            toast.success(toastMessage, {
              description: description,
              duration: 5000
            });
          }
          
          // Always ensure the business dashboard is refreshed
          // Directly invalidate dashboard queries to ensure immediate update
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
          queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
        },
        (status) => handleChannelStatus('client-business-transactions', status),
        // Automatically invalidate these queries on any event
        [
          ['client-payments', businessId],
          ['payment-transactions', businessId],
          ['client-business-transactions', businessId],
          ['dashboard-stats', businessId]
        ]
      );
      
      subscriptionIds.push(subscriptionId);
    };
    
    // Set up all subscriptions
    setupPaymentTransactionsSubscription();
    setupPaymentsSubscription();
    setupClientBusinessTransactionsSubscription();
    setupBookingsSubscription();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up client payment and booking monitoring');
      subscriptionIds.forEach(id => {
        enhancedRealtimeManager.unsubscribeAll(id);
      });
    };
  }, [businessId, queryClient]);
  
  return { hasConnectionErrors: Object.values(connectionErrors).some(Boolean) };
};
