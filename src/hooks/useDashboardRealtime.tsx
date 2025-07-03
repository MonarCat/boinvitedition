import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeStatus {
  bookings: boolean;
  payments: boolean;
  clientTransactions: boolean;
  clients: boolean;
  staff: boolean;
  staffAttendance: boolean;
  adminAlerts: boolean;
}

export const useDashboardRealtime = (businessId?: string) => {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<RealtimeStatus>({
    bookings: false,
    payments: false,
    clientTransactions: false,
    clients: false,
    staff: false,
    staffAttendance: false,
    adminAlerts: false
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      console.warn('🚫 useDashboardRealtime: No businessId provided');
      return;
    }

    console.log('🔄 Setting up enhanced real-time dashboard listeners for business:', businessId);
    const channels: Array<ReturnType<typeof supabase.channel>> = [];

    try {
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
            console.log('📊 DASHBOARD: Booking change detected:', payload);
            // Invalidate dashboard stats to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            console.log('✅ Dashboard stats invalidated for booking change');
            
            // Show notification for new bookings
            if (payload.eventType === 'INSERT') {
              toast.success('New booking received!', {
                description: 'A new booking has been added to your dashboard.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Booking channel status:', status);
          setConnectionStatus(prev => ({ ...prev, bookings: status === 'SUBSCRIBED' }));
          if (status === 'SUBSCRIBED') {
            console.log('✅ Booking channel connected successfully');
          }
          if (status === 'CHANNEL_ERROR') {
            setConnectionError('Error connecting to booking updates');
          }
        });
      
      channels.push(bookingChannel);

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
            console.log('💰 DASHBOARD: Payment transaction change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
            console.log('✅ Dashboard stats invalidated for payment change');
            
            // Show notification for new payments
            if (payload.eventType === 'INSERT') {
              toast.success('New payment received!', {
                description: 'A new payment has been processed.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Payment channel status:', status);
          setConnectionStatus(prev => ({ ...prev, payments: status === 'SUBSCRIBED' }));
        });
      
      channels.push(paymentChannel);

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
            console.log('💳 DASHBOARD: Client transaction change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
            console.log('✅ Dashboard stats invalidated for client transaction');
            
            // Show notification for new transactions
            if (payload.eventType === 'INSERT') {
              toast.success('New transaction recorded!', {
                description: 'A new client transaction has been recorded.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Client transaction channel status:', status);
          setConnectionStatus(prev => ({ ...prev, clientTransactions: status === 'SUBSCRIBED' }));
        });
      
      channels.push(clientTransactionChannel);

      // Listen to payments table changes (additional payment source)
      const paymentsTableChannel = supabase
        .channel('dashboard-payments-table')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `business_id=eq.${businessId}`
          },
          (payload) => {
            console.log('💳 DASHBOARD: Payments table change detected:', payload);
            // Invalidate dashboard stats and related queries
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
            // Show notification for new payments
            if (payload.eventType === 'INSERT') {
              toast.success('New payment recorded!', {
                description: 'A new payment has been recorded.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Payments table channel status:', status);
          setConnectionStatus(prev => ({ ...prev, payments: status === 'SUBSCRIBED' }));
        });
      channels.push(paymentsTableChannel);

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
            console.log('👥 DASHBOARD: Client change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
            console.log('✅ Dashboard stats invalidated for client change');
            
            // Show notification for new clients
            if (payload.eventType === 'INSERT') {
              toast.success('New client added!', {
                description: 'A new client has been added to your business.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Client channel status:', status);
          setConnectionStatus(prev => ({ ...prev, clients: status === 'SUBSCRIBED' }));
        });
      
      channels.push(clientChannel);
      
      // Listen to staff changes
      const staffChannel = supabase
        .channel('dashboard-staff')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'staff',
            filter: `business_id=eq.${businessId}`
          },
          (payload) => {
            console.log('👨‍💼 DASHBOARD: Staff change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['staff', businessId] });
            console.log('✅ Dashboard stats invalidated for staff change');
            
            // Show notification for staff changes
            if (payload.eventType === 'INSERT') {
              toast.success('New staff member added!', {
                description: 'A new staff member has been added to your business.',
                duration: 5000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Staff channel status:', status);
          setConnectionStatus(prev => ({ ...prev, staff: status === 'SUBSCRIBED' }));
        });
      
      channels.push(staffChannel);
      
      // Listen to staff attendance changes
      const staffAttendanceChannel = supabase
        .channel('dashboard-staff-attendance')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'staff_attendance',
            filter: `business_id=eq.${businessId}`
          },
          (payload) => {
            console.log('🕒 DASHBOARD: Staff attendance change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['staff-attendance', businessId] });
            console.log('✅ Dashboard stats invalidated for staff attendance change');
          }
        )
        .subscribe((status) => {
          console.log('📡 Staff attendance channel status:', status);
          setConnectionStatus(prev => ({ ...prev, staffAttendance: status === 'SUBSCRIBED' }));
        });
      
      channels.push(staffAttendanceChannel);
      
      // Listen to admin alerts
      const adminAlertsChannel = supabase
        .channel('dashboard-admin-alerts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_alerts',
            filter: `business_id=eq.${businessId}`
          },
          (payload) => {
            console.log('🔔 DASHBOARD: Admin alert change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['admin-alerts', businessId] });
            console.log('✅ Dashboard stats invalidated for admin alert change');
            
            // Show notification for new alerts
            if (payload.eventType === 'INSERT') {
              toast.info('New admin alert!', {
                description: payload.new?.message || 'You have a new notification',
                duration: 7000
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Admin alerts channel status:', status);
          setConnectionStatus(prev => ({ ...prev, adminAlerts: status === 'SUBSCRIBED' }));
        });
      
      channels.push(adminAlertsChannel);
      
      console.log('🚀 All dashboard real-time channels initialized for business:', businessId);
    } catch (error) {
      console.error('❌ Error setting up real-time listeners:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error setting up real-time updates');
    }

    // Automatic reconnection setup
    const reconnectionInterval = setInterval(() => {
      const hasDisconnectedChannels = Object.values(connectionStatus).some(status => status === false);
      if (hasDisconnectedChannels && channels.length > 0) {
        console.log('🔄 Attempting to reconnect disconnected channels...');
        channels.forEach(channel => {
          try {
            channel.unsubscribe();
            channel.subscribe();
          } catch (error) {
            console.error('❌ Failed to reconnect channel:', error);
          }
        });
      }
    }, 30000); // Try reconnecting every 30 seconds

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up dashboard real-time listeners for business:', businessId);
      channels.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('❌ Error removing channel:', error);
        }
      });
      clearInterval(reconnectionInterval);
      console.log('✅ All dashboard channels and intervals cleaned up');
    };
  }, [businessId, queryClient, connectionStatus]);
  
  return { connectionStatus, connectionError };
};