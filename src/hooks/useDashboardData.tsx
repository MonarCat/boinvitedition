import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils';
import { useDashboardRealtime } from './useDashboardRealtime';

export type TimePeriod = 'today' | 'week' | 'month' | 'year';

interface DashboardStats {
  activeBookings: number;
  totalRevenue: number;
  totalBookings: number;
  totalClients: number;
}

const getDateRange = (period: TimePeriod) => {
  const now = new Date();
  let startDate: string;
  let endDate: string;

  switch (period) {
    case 'today': {
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
      break;
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      break;
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      break;
    }
    case 'year': {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      break;
    }
    default: {
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
    }
  }

  return { startDate, endDate };
};

export const useDashboardData = (businessId?: string) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const queryClient = useQueryClient();

  // Ensure realtime updates are active
  useDashboardRealtime(businessId);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', businessId, timePeriod],
    queryFn: async () => {
      if (!businessId) return null;

      console.log(`🚀 Fetching dashboard stats for period: ${timePeriod}`);

      const { startDate, endDate } = getDateRange(timePeriod);

      // Fetch all data in parallel
      const [bookingsRes, paymentsRes, clientsRes, totalBookingsRes] = await Promise.all([
        // Todays bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('business_id', businessId)
          .gte('created_at', `${startDate}T00:00:00.000Z`)
          .lte('created_at', `${endDate}T23:59:59.999Z`),
        // Todays revenue from all completed payments
        supabase
          .from('payment_transactions')
          .select('amount')
          .eq('business_id', businessId)
          .eq('status', 'completed')
          .gte('created_at', `${startDate}T00:00:00.000Z`)
          .lte('created_at', `${endDate}T23:59:59.999Z`),
        // Total clients for the business
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId),
        // Total bookings for the business
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
      ]);

      if (bookingsRes.error || paymentsRes.error || clientsRes.error || totalBookingsRes.error) {
        console.error('Error fetching dashboard stats:', {
          bookingsError: bookingsRes.error,
          paymentsError: paymentsRes.error,
          clientsError: clientsRes.error,
          totalBookingsError: totalBookingsRes.error,
        });
        throw new Error('Failed to fetch dashboard statistics');
      }

      const todaysRevenue = (paymentsRes.data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);

      const dashboardStats = {
        activeBookings: bookingsRes.count || 0, // Today's bookings
        totalRevenue: todaysRevenue, // Today's revenue
        totalBookings: totalBookingsRes.count || 0, // All-time bookings
        totalClients: clientsRes.count || 0, // All-time clients
      };

      console.log('📊 Calculated Dashboard Stats:', dashboardStats);
      return dashboardStats;
    },
    enabled: !!businessId,
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const manualRefresh = () => {
    console.log('🔄 Manually refreshing dashboard data...');
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId, timePeriod] });
  };

  return {
    stats,
    isLoading,
    error,
    timePeriod,
    setTimePeriod,
    manualRefresh,
    lastRefresh: stats ? new Date() : undefined, // This can be derived from query state if needed
  };
};
