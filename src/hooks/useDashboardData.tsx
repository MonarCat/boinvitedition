
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatCurrency';

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
    
    // Helper function to fetch latest REAL stats after any update
    const fetchLatestRealStats = async () => {
      console.log('REALTIME: Fetching latest REAL dashboard stats for today');
      
      const { startDate, endDate } = getDateRange(timePeriod);
      
      try {
        // Get today's payment transactions first (most reliable for revenue)
        const todayStart = timePeriod === 'today' ? startDate + 'T00:00:00.000Z' : startDate;
        const todayEnd = timePeriod === 'today' ? endDate + 'T23:59:59.999Z' : endDate;
        
        const { data: todayPayments } = await supabase
          .from('payment_transactions')
          .select('business_amount, amount, status, created_at')
          .eq('business_id', businessId)
          .in('status', ['completed', 'success'])
          .eq('transaction_type', 'client_to_business')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd);
        
        console.log('Today\'s payments found:', todayPayments?.length || 0, todayPayments);
        
        // Calculate revenue from payment transactions
        const revenueFromPayments = todayPayments?.reduce((sum, payment) => 
          sum + Number(payment.business_amount || payment.amount || 0), 0
        ) || 0;
        
        // Get today's bookings
        const { data: todayBookings } = await supabase
          .from('bookings')
          .select('total_amount, payment_status, status, created_at, booking_date')
          .eq('business_id', businessId)
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd);
        
        console.log('Today\'s bookings found:', todayBookings?.length || 0, todayBookings);
        
        // Get revenue from paid bookings
        const paidBookings = todayBookings?.filter(b => 
          b.payment_status === 'paid' || b.payment_status === 'completed'
        ) || [];
        
        const revenueFromBookings = paidBookings.reduce((sum, booking) => 
          sum + Number(booking.total_amount || 0), 0
        );
        
        // Use the higher of the two revenue calculations
        const totalRevenue = Math.max(revenueFromPayments, revenueFromBookings);
        
        console.log('Revenue calculation:', {
          revenueFromPayments,
          revenueFromBookings,
          totalRevenue,
          paidBookingsCount: paidBookings.length
        });
        
        // Get REAL client count
        const { count: clientCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId);
        
        const newRealStats = {
          activeBookings: todayBookings?.length || 0,
          totalRevenue: totalRevenue,
          totalBookings: todayBookings?.length || 0,
          totalClients: clientCount || 0,
          lastUpdated: new Date()
        };
        
        console.log('REALTIME: Updated REAL dashboard stats:', newRealStats);
        setRealtimeStats(newRealStats);
        setLastRefresh(new Date());
        
        return newRealStats;
      } catch (error) {
        console.error('Error fetching realtime REAL stats:', error);
        return null;
      }
    };
    
    // Subscribe to payment transactions table for REAL data updates
    channel.on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'payment_transactions',
        filter: `business_id=eq.${businessId}`
      },
      async (payload) => {
        console.log('REALTIME: Payment transaction change detected!', payload);
        await fetchLatestRealStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    // Subscribe to bookings table for REAL data updates
    .on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `business_id=eq.${businessId}`
      },
      async (payload) => {
        console.log('REALTIME: REAL Booking change detected!', payload);
        await fetchLatestRealStats();
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
        console.log('REALTIME: REAL Client change detected!');
        await fetchLatestRealStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'client_business_transactions',
        filter: `business_id=eq.${businessId}`
      },
      async () => {
        console.log('REALTIME: REAL Client business transaction change detected!');
        await fetchLatestRealStats();
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      }
    )
    .subscribe();
    
    // Initial REAL stats fetch
    fetchLatestRealStats();

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

  // Get dashboard statistics with time period filtering - REAL DATA ONLY
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', actualBusinessId, timePeriod, lastRefresh],
    queryFn: async () => {
      console.log('Fetching REAL dashboard stats, period:', timePeriod);
      
      // If we have realtime stats, use those for immediate UI update
      if (realtimeStats) {
        console.log('Using realtime REAL stats for dashboard');
        return realtimeStats;
      }
      
      if (!actualBusinessId) return {
        activeBookings: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalClients: 0,
      };

      const { startDate, endDate } = getDateRange(timePeriod);

      // Primary revenue source: Payment transactions (most reliable)
      const todayStart = timePeriod === 'today' ? startDate + 'T00:00:00.000Z' : startDate;
      const todayEnd = timePeriod === 'today' ? endDate + 'T23:59:59.999Z' : endDate;
      
      const { data: paymentTransactions } = await supabase
        .from('payment_transactions')
        .select('business_amount, amount, status, created_at')
        .eq('business_id', actualBusinessId)
        .in('status', ['completed', 'success'])
        .eq('transaction_type', 'client_to_business')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // Calculate revenue from payment transactions
      const revenueFromPayments = paymentTransactions?.reduce((sum, payment) => 
        sum + Number(payment.business_amount || payment.amount || 0), 0
      ) || 0;

      // Get REAL bookings for the period
      const { data: periodBookings } = await supabase
        .from('bookings')
        .select('total_amount, payment_status, status, created_at, booking_date')
        .eq('business_id', actualBusinessId)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // Calculate REAL revenue from paid bookings as backup
      const paidBookings = periodBookings?.filter(booking => 
        booking.payment_status === 'paid' || booking.payment_status === 'completed'
      ) || [];
      
      const revenueFromBookings = paidBookings.reduce((sum, booking) => 
        sum + Number(booking.total_amount || 0), 0
      );

      // Use the higher of the two revenue calculations
      const totalRevenue = Math.max(revenueFromPayments, revenueFromBookings);

      // Get REAL total clients count directly
      let totalClients = 0;
      try {
        const { count } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', actualBusinessId);
          
        totalClients = count || 0;
      } catch (error) {
        console.error('Error fetching REAL client count:', error);
      }
        
      const realStats = {
        activeBookings: periodBookings?.length || 0,
        totalRevenue: totalRevenue,
        totalBookings: periodBookings?.length || 0,
        totalClients: totalClients,
      };
      
      console.log('REAL dashboard stats calculated:', realStats);
      return realStats;
    },
    enabled: !!actualBusinessId,
  });

  // Get currency from business data - always KES for consistency
  const currency = 'KES';

  // Format price function using the centralized utility
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Enhanced KPI refresh with forced REAL data reload
  const handleKpiRefresh = async () => {
    console.log('Forcing REAL dashboard data refresh');
    
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
    
    // Perform a direct fetch for immediate REAL data
    const { startDate, endDate } = getDateRange(timePeriod);
    
    try {
      // Execute parallel queries for fresh REAL data
      const [bookingsRes, clientsRes, recentPaymentsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('total_amount, payment_status, status, created_at')
          .eq('business_id', actualBusinessId)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate),
          
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', actualBusinessId),
          
        supabase
          .from('payment_transactions')
          .select('business_amount, amount')
          .eq('business_id', actualBusinessId)
          .eq('status', 'completed')
          .eq('transaction_type', 'client_to_business')
      ]);
      
      // Calculate REAL totals
      const completedBookings = bookingsRes.data?.filter(b => 
        b.payment_status === 'completed' || b.status === 'completed'
      ) || [];
      
      const totalRevenue = completedBookings.reduce((sum, booking) => 
        sum + Number(booking.total_amount || 0), 0
      );
        
      const additionalRevenue = recentPaymentsRes.data?.reduce((sum, payment) => 
        sum + Number(payment.business_amount || payment.amount || 0), 0
      ) || 0;
      
      // Set realtime stats for immediate UI update with REAL data
      setRealtimeStats({
        activeBookings: bookingsRes.data?.length || 0,
        totalRevenue: totalRevenue + additionalRevenue,
        totalBookings: bookingsRes.data?.length || 0,
        totalClients: clientsRes.count || 0,
        lastUpdated: new Date()
      });
      
      console.log('Manual refresh completed with fresh REAL data');
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
