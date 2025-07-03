import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  realtimeManager, 
  RealtimePayload, 
  ChannelStatus 
} from '@/services/RealtimeConnectionManager';

export interface UseRealtimeOptions {
  businessId: string;
  enableBookings?: boolean;
  enablePayments?: boolean;
  enableClientTransactions?: boolean;
  enableClients?: boolean;
  enableStaff?: boolean;
  enableStaffAttendance?: boolean;
  enableAdminAlerts?: boolean;
  showToasts?: boolean;
}

export interface RealtimeConnectionStatus {
  bookings: boolean;
  payments: boolean;
  clientTransactions: boolean;
  clients: boolean;
  staff: boolean;
  staffAttendance: boolean;
  adminAlerts: boolean;
}

/**
 * Hook for subscribing to realtime updates using the connection pooling manager
 */
export const useRealtime = (options: UseRealtimeOptions) => {
  const {
    businessId,
    enableBookings = true,
    enablePayments = true,
    enableClientTransactions = true,
    enableClients = true,
    enableStaff = true,
    enableStaffAttendance = true,
    enableAdminAlerts = true,
    showToasts = true
  } = options;
  
  const queryClient = useQueryClient();
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>({
    bookings: false,
    payments: false,
    clientTransactions: false,
    clients: false,
    staff: false,
    staffAttendance: false,
    adminAlerts: false
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use ref to store subscription IDs to avoid dependency issues
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!businessId) {
      console.warn('⚠️ useRealtime: No businessId provided');
      return;
    }

    console.log('🔄 Setting up optimized real-time subscriptions for business:', businessId);
    // Clear previous subscriptions
    subscriptionIdsRef.current.forEach(id => {
      realtimeManager.unsubscribeAll(id);
    });
    subscriptionIdsRef.current = [];
    
    const ids: string[] = [];

    // Helper function to update connection status
    const updateStatus = (key: keyof RealtimeConnectionStatus, status: ChannelStatus) => {
      setConnectionStatus(prev => ({
        ...prev,
        [key]: status === 'SUBSCRIBED'
      }));
      
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnectionError(`Connection issues with ${key} updates`);
      } else if (status === 'SUBSCRIBED') {
        setConnectionError(null);
      }
    };

    try {
      // Bookings subscription
      if (enableBookings) {
        const id = realtimeManager.subscribe(
          {
            table: 'bookings',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('📊 Booking change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
            queryClient.invalidateQueries({ queryKey: ['bookings-list', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            
            // Show toast notification for new bookings
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success('New booking received!', {
                description: 'A new booking has been added to your dashboard.',
                duration: 5000
              });
            }
          },
          (status) => updateStatus('bookings', status)
        );
        ids.push(id);
      }

      // Payments subscription
      if (enablePayments) {
        const id = realtimeManager.subscribe(
          {
            table: 'payment_transactions',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('💰 Payment transaction change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            
            // Show toast notification for new payments
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success('New payment received!', {
                description: 'A new payment has been processed.',
                duration: 5000
              });
            }
          },
          (status) => updateStatus('payments', status)
        );
        ids.push(id);
      }

      // Client transactions subscription
      if (enableClientTransactions) {
        const id = realtimeManager.subscribe(
          {
            table: 'client_business_transactions',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('💳 Client transaction change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
            queryClient.invalidateQueries({ queryKey: ['business-data', businessId] });
            
            // Show toast notification for new transactions
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success('New transaction recorded!', {
                description: 'A new client transaction has been recorded.',
                duration: 5000
              });
            }
          },
          (status) => updateStatus('clientTransactions', status)
        );
        ids.push(id);
      }

      // Clients subscription
      if (enableClients) {
        const id = realtimeManager.subscribe(
          {
            table: 'clients',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('👥 Client change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
            
            // Show toast notification for new clients
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success('New client added!', {
                description: 'A new client has been added to your business.',
                duration: 5000
              });
            }
          },
          (status) => updateStatus('clients', status)
        );
        ids.push(id);
      }

      // Staff subscription
      if (enableStaff) {
        const id = realtimeManager.subscribe(
          {
            table: 'staff',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('👨‍💼 Staff change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['staff', businessId] });
            
            // Show toast notification for new staff
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success('New staff member added!', {
                description: 'A new staff member has been added to your business.',
                duration: 5000
              });
            }
          },
          (status) => updateStatus('staff', status)
        );
        ids.push(id);
      }

      // Staff attendance subscription
      if (enableStaffAttendance) {
        const id = realtimeManager.subscribe(
          {
            table: 'staff_attendance',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('🕒 Staff attendance change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['staff-attendance', businessId] });
          },
          (status) => updateStatus('staffAttendance', status)
        );
        ids.push(id);
      }

      // Admin alerts subscription
      if (enableAdminAlerts) {
        const id = realtimeManager.subscribe(
          {
            table: 'admin_alerts',
            filter: `business_id=eq.${businessId}`
          },
          (payload: RealtimePayload) => {
            console.log('🔔 Admin alert change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
            queryClient.invalidateQueries({ queryKey: ['admin-alerts', businessId] });
            
            // Show toast notification for new alerts with the alert message
            if (showToasts && payload.eventType === 'INSERT') {
              toast.info('New admin alert!', {
                description: payload.new?.message as string || 'You have a new notification',
                duration: 7000
              });
            }
          },
          (status) => updateStatus('adminAlerts', status)
        );
        ids.push(id);
      }

      // Store subscription IDs for cleanup
      subscriptionIdsRef.current = ids;
      console.log('🚀 All realtime subscriptions set up for business:', businessId);

    } catch (error) {
      console.error('❌ Error setting up realtime subscriptions:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error setting up realtime updates');
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up realtime subscriptions');
      subscriptionIdsRef.current.forEach(id => {
        realtimeManager.unsubscribeAll(id);
      });
      console.log('✅ All realtime subscriptions cleaned up');
    };
  }, [businessId, queryClient, enableBookings, enablePayments, enableClientTransactions, 
      enableClients, enableStaff, enableStaffAttendance, enableAdminAlerts, showToasts]);

  // Check overall connection status
  const isFullyConnected = Object.values(connectionStatus).every(status => status);
  const isPartiallyConnected = Object.values(connectionStatus).some(status => status);
  const isDisconnected = Object.values(connectionStatus).every(status => !status);

  const forceReconnect = () => {
    realtimeManager.reconnectAll();
    toast.info('Reconnecting...', {
      description: 'Attempting to reconnect all real-time channels.'
    });
  };

  return {
    connectionStatus,
    connectionError,
    isFullyConnected,
    isPartiallyConnected,
    isDisconnected,
    forceReconnect
  };
};
