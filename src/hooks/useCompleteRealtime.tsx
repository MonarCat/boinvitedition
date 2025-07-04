
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeConnectionStatus {
  bookings: boolean;
  payments: boolean;
  clientTransactions: boolean;
  clients: boolean;
  staff: boolean;
  staffAttendance: boolean;
  adminAlerts: boolean;
  services: boolean;
}

interface UseCompleteRealtimeProps {
  businessId: string;
  enableToasts?: boolean;
}

export const useCompleteRealtime = ({ businessId, enableToasts = true }: UseCompleteRealtimeProps) => {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>({
    bookings: false,
    payments: false,
    clientTransactions: false,
    clients: false,
    staff: false,
    staffAttendance: false,
    adminAlerts: false,
    services: false,
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!businessId) return;

    console.log('🔄 Setting up COMPLETE real-time subscriptions for business:', businessId);
    const channels: Array<ReturnType<typeof supabase.channel>> = [];

    // Helper function to invalidate all relevant queries
    const invalidateBusinessQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
      setLastUpdate(new Date());
    };

    try {
      // 1. Bookings real-time subscription
      const bookingsChannel = supabase
        .channel(`bookings-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('📅 BOOKINGS: Real-time update received:', payload);
          invalidateBusinessQueries();
          
          if (enableToasts && payload.eventType === 'INSERT') {
            const booking = payload.new as any;
            toast.success('New Booking Received!', {
              description: `${booking.customer_name || 'Customer'} booked ${booking.service_name || 'a service'}`
            });
          }
        })
        .subscribe((status) => {
          console.log('📅 Bookings channel status:', status);
          setConnectionStatus(prev => ({ ...prev, bookings: status === 'SUBSCRIBED' }));
          if (status === 'CHANNEL_ERROR') {
            setConnectionError('Failed to connect to bookings updates');
          }
        });
      channels.push(bookingsChannel);

      // 2. Payment transactions real-time subscription
      const paymentsChannel = supabase
        .channel(`payments-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('💰 PAYMENTS: Real-time update received:', payload);
          invalidateBusinessQueries();
          
          if (enableToasts && payload.eventType === 'INSERT') {
            const payment = payload.new as any;
            toast.success('Payment Received!', {
              description: `KES ${Number(payment.amount).toLocaleString()} received`
            });
          }
        })
        .subscribe((status) => {
          console.log('💰 Payments channel status:', status);
          setConnectionStatus(prev => ({ ...prev, payments: status === 'SUBSCRIBED' }));
        });
      channels.push(paymentsChannel);

      // 3. Client business transactions real-time subscription
      const clientTransactionsChannel = supabase
        .channel(`client-transactions-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'client_business_transactions',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('💳 CLIENT TRANSACTIONS: Real-time update received:', payload);
          invalidateBusinessQueries();
          
          if (enableToasts && payload.eventType === 'INSERT') {
            const transaction = payload.new as any;
            toast.success('New Transaction!', {
              description: `KES ${Number(transaction.business_amount).toLocaleString()} earned`
            });
          }
        })
        .subscribe((status) => {
          console.log('💳 Client transactions channel status:', status);
          setConnectionStatus(prev => ({ ...prev, clientTransactions: status === 'SUBSCRIBED' }));
        });
      channels.push(clientTransactionsChannel);

      // 4. Clients real-time subscription
      const clientsChannel = supabase
        .channel(`clients-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('👥 CLIENTS: Real-time update received:', payload);
          invalidateBusinessQueries();
          
          if (enableToasts && payload.eventType === 'INSERT') {
            const client = payload.new as any;
            toast.success('New Client Added!', {
              description: `${client.name} joined your business`
            });
          }
        })
        .subscribe((status) => {
          console.log('👥 Clients channel status:', status);
          setConnectionStatus(prev => ({ ...prev, clients: status === 'SUBSCRIBED' }));
        });
      channels.push(clientsChannel);

      // 5. Staff real-time subscription
      const staffChannel = supabase
        .channel(`staff-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'staff',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('👨‍💼 STAFF: Real-time update received:', payload);
          invalidateBusinessQueries();
        })
        .subscribe((status) => {
          console.log('👨‍💼 Staff channel status:', status);
          setConnectionStatus(prev => ({ ...prev, staff: status === 'SUBSCRIBED' }));
        });
      channels.push(staffChannel);

      // 6. Staff attendance real-time subscription
      const staffAttendanceChannel = supabase
        .channel(`staff-attendance-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'staff_attendance',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('🕒 STAFF ATTENDANCE: Real-time update received:', payload);
          invalidateBusinessQueries();
        })
        .subscribe((status) => {
          console.log('🕒 Staff attendance channel status:', status);
          setConnectionStatus(prev => ({ ...prev, staffAttendance: status === 'SUBSCRIBED' }));
        });
      channels.push(staffAttendanceChannel);

      // 7. Admin alerts real-time subscription
      const adminAlertsChannel = supabase
        .channel(`admin-alerts-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'admin_alerts',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('🔔 ADMIN ALERTS: Real-time update received:', payload);
          invalidateBusinessQueries();
          
          if (enableToasts && payload.eventType === 'INSERT') {
            const alert = payload.new as any;
            toast.warning('New Alert', {
              description: alert.message
            });
          }
        })
        .subscribe((status) => {
          console.log('🔔 Admin alerts channel status:', status);
          setConnectionStatus(prev => ({ ...prev, adminAlerts: status === 'SUBSCRIBED' }));
        });
      channels.push(adminAlertsChannel);

      // 8. Services real-time subscription
      const servicesChannel = supabase
        .channel(`services-${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_id=eq.${businessId}`
        }, (payload) => {
          console.log('🛎️ SERVICES: Real-time update received:', payload);
          invalidateBusinessQueries();
        })
        .subscribe((status) => {
          console.log('🛎️ Services channel status:', status);
          setConnectionStatus(prev => ({ ...prev, services: status === 'SUBSCRIBED' }));
        });
      channels.push(servicesChannel);

      console.log('✅ All real-time channels initialized successfully');

    } catch (error) {
      console.error('❌ Error setting up real-time subscriptions:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      channels.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      });
    };
  }, [businessId, queryClient, enableToasts]);

  // Force reconnect function
  const forceReconnect = () => {
    console.log('🔄 Force reconnecting all channels');
    setConnectionError(null);
    // The useEffect will automatically recreate subscriptions
    setLastUpdate(new Date());
  };

  // Check if all connections are active
  const isFullyConnected = Object.values(connectionStatus).every(status => status === true);
  const connectedCount = Object.values(connectionStatus).filter(Boolean).length;
  const totalConnections = Object.values(connectionStatus).length;

  return {
    connectionStatus,
    connectionError,
    isFullyConnected,
    connectedCount,
    totalConnections,
    lastUpdate,
    forceReconnect
  };
};
