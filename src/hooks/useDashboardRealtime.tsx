import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardRealtime = (businessId?: string) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    console.log('🚀 Initializing dashboard real-time listener for business:', businessId);

    // Use a single channel for all dashboard-related subscriptions for efficiency
    const channel = supabase.channel(`dashboard-${businessId}-${Math.random().toString(36).slice(2, 9)}`);

    const invalidateStats = (tableName: string, eventType: string) => {
      console.log(`🔄 Real-time event received: ${eventType} on ${tableName}. Invalidating dashboard stats.`);
      
      // Invalidate queries with the base key to refetch all related stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `business_id=eq.${businessId}` }, (payload) => {
        invalidateStats('bookings', payload.eventType);
        if (payload.eventType === 'INSERT') {
          toast.success('New booking received!', {
            description: 'Your dashboard has been updated.',
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_transactions', filter: `business_id=eq.${businessId}` }, (payload) => {
        invalidateStats('payment_transactions', payload.eventType);
        if (payload.eventType === 'INSERT') {
          toast.success('New payment processed!', {
            description: 'Your dashboard has been updated with the latest revenue.',
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `business_id=eq.${businessId}` }, (payload) => {
        invalidateStats('payments', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${businessId}` }, (payload) => {
        invalidateStats('clients', payload.eventType);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_business_transactions', filter: `business_id=eq.${businessId}` }, (payload) => {
        invalidateStats('client_business_transactions', payload.eventType);
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Dashboard real-time listener connected!');
          setIsConnected(true);
          setError(null);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Dashboard real-time listener connection error:', err);
          setError('Real-time connection failed. Dashboard may not update automatically.');
          setIsConnected(false);
          toast.error('Real-time connection failed', {
            description: 'Dashboard updates may be delayed.',
          });
        }
        if (status === 'TIMED_OUT') {
          console.warn('⏳ Dashboard real-time listener connection timed out.');
          setError('Real-time connection timed out. Please refresh to reconnect.');
          setIsConnected(false);
          toast.warning('Real-time connection timed out', {
            description: 'Please refresh the page for live updates.',
          });
        }
      });

    return () => {
      console.log('🔌 Unsubscribing from dashboard channel');
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);

  return { isConnected, error };
};