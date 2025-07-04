import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils';

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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const queryClient = useQueryClient();
  
  // Enhanced real-time subscriptions with immediate data updates
  useEffect(() => {
    if (!businessId) return;
    
    console.log('Setting up REALTIME dashboard stats subscriptions for business:', businessId);
    
    // Create a single channel for all subscriptions
    const channel = supabase.channel(`realtime-dashboard-${businessId}-${Math.random().toString(36).substring(7)}`);
    
    // Helper function to fetch latest stats after any update
    const fetchLatestStats = async () => {
      console.log('REALTIME: Fetching latest dashboard stats');
      
      const { startDate, endDate } = getDateRange(timePeriod);
      
      try {
        // Get bookings for the period with enhanced filter
        const bookingsQuery = supabase
          .from('bookings')
          .select('*')
          .eq('business_id', businessId)
          .gte('date', startDate)
          .lte('date', endDate)
          .or('status.eq.confirmed,status.eq.completed,payment_status.eq.completed');
        
        // Get revenue from completed payments
        const paymentsQuery = supabase
          .from('bookings')
          .select('total_amount')
          .eq('business_id', businessId)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('payment_status', 'completed');
          
        // Get client count
        const clientsQuery = supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId);
          
        // Get additional recent payments
        const recentPaymentsQuery = supabase
          .from('payment_transactions')
          .select('amount')
          .eq('business_id', businessId)
          .eq('status', 'completed')
          .eq('transaction_type', 'client_to_business');
          
        // Execute all queries in parallel  
        const [bookingsRes, paymentsRes, clientsRes, recentPaymentsRes] = 
          await Promise.all([bookingsQuery, paymentsQuery, clientsQuery, recentPaymentsQuery]);
          
        // Calculate totals
        const totalRevenue = (paymentsRes.data || [])
          .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
          
        const additionalRevenue = (recentPaymentsRes.data || [])
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          
        const newStats = {
          activeBookings: bookingsRes.data?.length || 0,
          totalRevenue: totalRevenue + additionalRevenue,
          totalBookings: bookingsRes.data?.length || 0,
          totalClients: clientsRes.count || 0,
          lastUpdated: new Date()
        };
        
        console.log('REALTIME: Updated dashboard stats:', newStats);
        setRealtimeStats(newStats);
        setLastRefresh(new Date());
        
        return newStats;
      } catch (error) {
        console.error('Error fetching realtime stats:', error);
        return null;
      }
    };
    
    // Subscribe to bookings table
    channel.on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `business_id=eq.${businessId}`
      },
      async (payload) => {
        console.log('REALTIME: Booking change detected!', payload);
        await fetchLatestStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    // Subscribe to clients table
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `business_id=eq.${businessId}`
      },
      async () => {
        console.log('REALTIME: Client change detected!');
        await fetchLatestStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    // Subscribe to payment_transactions table
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payment_transactions',
        filter: `business_id=eq.${businessId}`
      },
      async () => {
        console.log('REALTIME: Payment transaction change detected!');
        await fetchLatestStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    // Subscribe to client_business_transactions table
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'client_business_transactions',
        filter: `business_id=eq.${businessId}`
      },
      async () => {
        console.log('REALTIME: Client business transaction change detected!');
        await fetchLatestStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    .subscribe();
    
    // Initial stats fetch
    fetchLatestStats();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up realtime dashboard subscriptions');
      channel.unsubscribe();
    };
  }, [businessId, queryClient, timePeriod]);

  // Get business data
  const { data: business } = useQuery({
    queryKey: ['business-data', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      console.log('Fetching business data');
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });

  const actualBusinessId = businessId || business?.id;

  // Get dashboard statistics with time period filtering
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', actualBusinessId, timePeriod, lastRefresh],
    queryFn: async () => {
      console.log('Fetching dashboard stats, period:', timePeriod);
      
      // If we have realtime stats, use those for immediate UI update
      if (realtimeStats) {
        console.log('Using realtime stats for dashboard');
        return realtimeStats;
      }
      
      if (!actualBusinessId) return {
        activeBookings: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalClients: 0,
      };

      const { startDate, endDate } = getDateRange(timePeriod);

      // Get bookings for the period, including all with completed payments 
      const { data: periodBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', actualBusinessId)
        .gte('date', startDate)
        .lte('date', endDate)
        .or('status.eq.confirmed,status.eq.completed,payment_status.eq.completed');

      // Get revenue from completed payments only
      const { data: periodPayments } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('business_id', actualBusinessId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('payment_status', 'completed');

      // Get total clients count directly to avoid typing issues
      let totalClients = 0;
      try {
        const { count } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', actualBusinessId);
          
        totalClients = count || 0;
      } catch (error) {
        console.error('Error fetching client count:', error);
      }

      const totalRevenue = periodPayments?.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0) || 0;

      // Additional query to ensure we're catching all recent payments
      const { data: recentPayments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('business_id', actualBusinessId)
        .eq('status', 'completed')
        .eq('transaction_type', 'client_to_business')
        .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString());
        
      // Calculate additional recent revenue that might not be in the bookings table yet
      const additionalRecentRevenue = recentPayments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;
        
      return {
        activeBookings: periodBookings?.length || 0,
        totalRevenue: totalRevenue + additionalRecentRevenue, // Include recent payments that might not be fully processed
        totalBookings: periodBookings?.length || 0,
        totalClients: totalClients,
      };
    },
    enabled: !!actualBusinessId,
  });

  // Get currency from business data
  const currency = business?.currency || 'KES';

  // Format price function using the centralized utility
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Enhanced KPI refresh with forced data reload and realtime update
  const handleKpiRefresh = async () => {
    console.log('Forcing dashboard data refresh');
    
    // Clear any cached realtime stats
    setRealtimeStats(null);
    
    // Update lastRefresh to force a query refetch
    setLastRefresh(new Date());
    
    // Explicitly invalidate all related queries
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', actualBusinessId] });
    queryClient.invalidateQueries({ queryKey: ['business-data', actualBusinessId] });
    queryClient.invalidateQueries({ queryKey: ['client-business-transactions'] });
    
    // Also invalidate queries by predicate
    queryClient.invalidateQueries({ 
      predicate: query => {
        const key = query.queryKey[0];
        return key === 'bookings' || 
               key === 'clients' || 
               key === 'payment_transactions' ||
               key === 'client-business-transactions';
      }
    });
    
    // Perform a direct fetch for immediate data
    const { startDate, endDate } = getDateRange(timePeriod);
    
    try {
      // Execute parallel queries for fresh data
      const [bookingsRes, paymentsRes, clientsRes, recentPaymentsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('business_id', actualBusinessId)
          .gte('date', startDate)
          .lte('date', endDate)
          .or('status.eq.confirmed,status.eq.completed,payment_status.eq.completed'),
          
        supabase
          .from('bookings')
          .select('total_amount')
          .eq('business_id', actualBusinessId)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('payment_status', 'completed'),
          
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', actualBusinessId),
          
        supabase
          .from('payment_transactions')
          .select('amount')
          .eq('business_id', actualBusinessId)
          .eq('status', 'completed')
          .eq('transaction_type', 'client_to_business')
      ]);
      
      // Calculate totals
      const totalRevenue = (paymentsRes.data || [])
        .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
        
      const additionalRevenue = (recentPaymentsRes.data || [])
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      
      // Set realtime stats for immediate UI update
      setRealtimeStats({
        activeBookings: bookingsRes.data?.length || 0,
        totalRevenue: totalRevenue + additionalRevenue,
        totalBookings: bookingsRes.data?.length || 0,
        totalClients: clientsRes.count || 0,
        lastUpdated: new Date()
      });
      
      console.log('Manual refresh completed with fresh data');
    } catch (error) {
      console.error('Error during manual refresh:', error);
    }
    
    // Also trigger the standard refetch
    refetch();
  };

  return {
    business,
    stats: stats || {
      activeBookings: 0,
      totalRevenue: 0,
      totalBookings: 0,
      totalClients: 0,
    },
    statsLoading,
    currency,
    formatPrice,
    handleKpiRefresh,
    timePeriod,
    setTimePeriod,
    lastUpdated: realtimeStats?.lastUpdated || lastRefresh
  };
};
