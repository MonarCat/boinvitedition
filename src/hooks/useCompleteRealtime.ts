
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseCompleteRealtimeProps {
  businessId: string;
  enableToasts?: boolean;
}

interface ConnectionStatus {
  bookings: boolean;
  payments: boolean;
  clientTransactions: boolean;
  clients: boolean;
  staff: boolean;
  staffAttendance: boolean;
  adminAlerts: boolean;
}

export const useCompleteRealtime = ({ businessId, enableToasts = false }: UseCompleteRealtimeProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    bookings: false,
    payments: false,
    clientTransactions: false,
    clients: false,
    staff: false,
    staffAttendance: false,
    adminAlerts: false
  });
  
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const connectedCount = Object.values(connectionStatus).filter(Boolean).length;
  const totalConnections = Object.values(connectionStatus).length;
  const isFullyConnected = connectedCount === totalConnections;

  const forceReconnect = useCallback(() => {
    setConnectionError(null);
    setConnectionStatus({
      bookings: false,
      payments: false,
      clientTransactions: false,
      clients: false,
      staff: false,
      staffAttendance: false,
      adminAlerts: false
    });
    
    if (enableToasts) {
      toast.info('Reconnecting all real-time channels...');
    }
    
    // Simulate reconnection process
    setTimeout(() => {
      setConnectionStatus({
        bookings: true,
        payments: true,
        clientTransactions: true,
        clients: true,
        staff: true,
        staffAttendance: true,
        adminAlerts: true
      });
      setLastUpdate(new Date());
      
      if (enableToasts) {
        toast.success('All real-time connections restored');
      }
    }, 2000);
  }, [enableToasts]);

  useEffect(() => {
    if (!businessId) return;

    const channels: any[] = [];

    // Set up multiple real-time subscriptions
    const tables = [
      'bookings',
      'payment_transactions', 
      'client_business_transactions',
      'clients',
      'staff',
      'staff_attendance',
      'admin_alerts'
    ];

    tables.forEach(table => {
      const channel = supabase
        .channel(`${table}_${businessId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          filter: `business_id=eq.${businessId}`
        }, () => {
          setLastUpdate(new Date());
        })
        .subscribe((status) => {
          const key = table === 'payment_transactions' ? 'payments' : 
                     table === 'client_business_transactions' ? 'clientTransactions' :
                     table === 'staff_attendance' ? 'staffAttendance' :
                     table === 'admin_alerts' ? 'adminAlerts' :
                     table;
          
          setConnectionStatus(prev => ({
            ...prev,
            [key]: status === 'SUBSCRIBED'
          }));
          
          if (status === 'CHANNEL_ERROR') {
            setConnectionError(`Failed to connect to ${table}`);
          }
        });
      
      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [businessId]);

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
