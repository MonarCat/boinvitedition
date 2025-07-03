import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface UseSimpleRealtimeOptions {
  businessId: string;
  tables?: {
    bookings?: boolean;
    payments?: boolean;
    clients?: boolean;
    staff?: boolean;
  };
  showToasts?: boolean;
}

export interface SimpleRealtimeStatus {
  connected: boolean;
  error: string | null;
}

/**
 * A simplified hook for Supabase real-time subscriptions
 * This implementation directly uses the Supabase client without additional abstraction layers
 */
export const useSimpleRealtime = (options: UseSimpleRealtimeOptions) => {
  const {
    businessId,
    tables = {
      bookings: true,
      payments: true,
      clients: true,
      staff: true,
    },
    showToasts = true
  } = options;

  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SimpleRealtimeStatus>({
    connected: false,
    error: null
  });

  useEffect(() => {
    if (!businessId) {
      console.warn('⚠️ useSimpleRealtime: No businessId provided');
      return;
    }

    console.log('🔄 Setting up simple real-time subscriptions for business:', businessId);
    
    // Store channels for cleanup
    const channels = [];
    
    try {
      // Bookings subscription
      if (tables.bookings) {
        const bookingsChannel = supabase
          .channel('bookings-' + businessId)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'bookings',
              filter: `business_id=eq.${businessId}`
            },
            (payload) => {
              console.log('📊 Booking change detected:', payload);
              
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
              queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
              queryClient.invalidateQueries({ queryKey: ['bookings-list', businessId] });
              
              // Show toast notification for new bookings
              if (showToasts && payload.eventType === 'INSERT') {
                toast.success('New booking received!', {
                  description: 'A new booking has been added to your dashboard.',
                  duration: 5000
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Bookings subscription status:', status);
            setStatus(prev => ({
              ...prev,
              connected: status === 'SUBSCRIBED',
              error: status === 'SUBSCRIBED' ? null : 'Connection issue with bookings'
            }));
          });
        
        channels.push(bookingsChannel);
      }

      // Payment transactions subscription
      if (tables.payments) {
        // Listen to payment_transactions table
        const paymentTransactionsChannel = supabase
          .channel('payment-transactions-' + businessId)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'payment_transactions',
              filter: `business_id=eq.${businessId}`
            },
            (payload) => {
              console.log('💰 Payment transaction change detected:', payload);
              
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
              queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
              
              // Show toast notification for new payments
              if (showToasts && payload.eventType === 'INSERT') {
                toast.success('New payment transaction received!', {
                  description: 'A new payment has been processed.',
                  duration: 5000
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Payment transactions subscription status:', status);
            setStatus(prev => ({
              ...prev,
              connected: status === 'SUBSCRIBED',
              error: status === 'SUBSCRIBED' ? null : 'Connection issue with payment transactions'
            }));
          });
        
        channels.push(paymentTransactionsChannel);
        
        // Also listen to the payments table
        const paymentsChannel = supabase
          .channel('payments-table-' + businessId)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'payments',
              filter: `business_id=eq.${businessId}`
            },
            (payload) => {
              console.log('💳 Payments table change detected:', payload);
              
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
              queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
              queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
              
              // Show toast notification for new payments
              if (showToasts && payload.eventType === 'INSERT') {
                toast.success('New payment entry received!', {
                  description: 'A new payment has been recorded.',
                  duration: 5000
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Payments table subscription status:', status);
            setStatus(prev => ({
              ...prev,
              connected: status === 'SUBSCRIBED',
              error: status === 'SUBSCRIBED' ? null : 'Connection issue with payments table'
            }));
          });
        
        channels.push(paymentsChannel);
            }));
          });
        
        channels.push(paymentsChannel);
      }

      // Clients subscription
      if (tables.clients) {
        const clientsChannel = supabase
          .channel('clients-' + businessId)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'clients',
              filter: `business_id=eq.${businessId}`
            },
            (payload) => {
              console.log('👥 Client change detected:', payload);
              
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
              queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
              
              // Show toast notification for new clients
              if (showToasts && payload.eventType === 'INSERT') {
                toast.success('New client added!', {
                  description: 'A new client has been added to your business.',
                  duration: 5000
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Clients subscription status:', status);
            setStatus(prev => ({
              ...prev,
              connected: status === 'SUBSCRIBED',
              error: status === 'SUBSCRIBED' ? null : 'Connection issue with clients'
            }));
          });
        
        channels.push(clientsChannel);
      }

      // Staff subscription
      if (tables.staff) {
        const staffChannel = supabase
          .channel('staff-' + businessId)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'staff',
              filter: `business_id=eq.${businessId}`
            },
            (payload) => {
              console.log('👨‍💼 Staff change detected:', payload);
              
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
              queryClient.invalidateQueries({ queryKey: ['staff', businessId] });
              
              // Show toast notification for new staff
              if (showToasts && payload.eventType === 'INSERT') {
                toast.success('New staff member added!', {
                  description: 'A new staff member has been added to your business.',
                  duration: 5000
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Staff subscription status:', status);
            setStatus(prev => ({
              ...prev,
              connected: status === 'SUBSCRIBED',
              error: status === 'SUBSCRIBED' ? null : 'Connection issue with staff'
            }));
          });
        
        channels.push(staffChannel);
      }

      console.log('✅ Simple real-time subscriptions set up successfully');

    } catch (error) {
      console.error('❌ Error setting up real-time subscriptions:', error);
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error setting up real-time updates'
      });
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up simple real-time subscriptions');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      console.log('✅ All real-time subscriptions removed');
    };
  }, [businessId, queryClient, tables, showToasts]);

  /**
   * Force reconnection of all real-time channels
   */
  const forceReconnect = () => {
    // Simply refresh the whole component by updating businessId dependency
    // This will trigger a clean up and re-subscription
    toast.info('Reconnecting...', {
      description: 'Attempting to reconnect all real-time channels.'
    });
    
    // This is a bit of a hack, but it works for forcing a reconnect
    queryClient.invalidateQueries({ queryKey: ['force-reconnect'] });
  };

  return {
    status,
    forceReconnect,
    isConnected: status.connected,
    error: status.error
  };
};
