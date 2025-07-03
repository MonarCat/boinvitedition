import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { safeSupabaseOperation } from '@/utils/connectionHealth';
import { enhancedRealtimeManager } from '@/services/EnhancedRealtimeManager';
import type { ChannelStatus } from '@/services/EnhancedRealtimeManager';

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
              
          // Show toast notification for payment updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            toast.success('Payment updated', {
              description: 'Your payment information has been updated.',
              duration: 5000
            });
          }
        },
        (status) => handleChannelStatus('payments-table', status),
        // Automatically invalidate these queries on any event
        [
          ['client-payments', businessId],
          ['payments', businessId],
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

    // Set up all subscriptions
    setupPaymentTransactionsSubscription();
    setupPaymentsSubscription();
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
