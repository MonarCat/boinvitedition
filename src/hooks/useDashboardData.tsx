
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export const useDashboardData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realTimeStats, setRealTimeStats] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    monthlyBookings: 0,
    totalClients: 0
  });

  // Fetch business data
  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const today = format(new Date(), 'yyyy-MM-dd');
      const currentMonth = format(new Date(), 'yyyy-MM');

      // Get active bookings for today
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('business_id', business.id)
        .eq('booking_date', today)
        .neq('status', 'cancelled');

      // Get monthly bookings
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('business_id', business.id)
        .gte('booking_date', `${currentMonth}-01`)
        .neq('status', 'cancelled');

      // Get total clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', business.id);

      const todayRevenue = todayBookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

      return {
        activeBookings: todayBookings?.length || 0,
        todayRevenue,
        monthlyBookings: monthlyBookings?.length || 0,
        totalClients: clients?.length || 0
      };
    },
    enabled: !!business,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!business) return;

    const channels = [
      supabase
        .channel('bookings-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `business_id=eq.${business.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        })
        .subscribe(),

      supabase
        .channel('clients-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'clients',
          filter: `business_id=eq.${business.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        })
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [business, queryClient]);

  // Update local state when stats change
  useEffect(() => {
    if (stats) {
      setRealTimeStats(stats);
    }
  }, [stats]);

  const currency = business?.currency || 'USD';
  const formatPrice = (amount: number) => {
    if (currency === 'KES') {
      return `KES ${amount}`;
    }
    return `$${amount}`;
  };

  const handleKpiRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  return {
    business,
    stats: realTimeStats,
    currency,
    formatPrice,
    handleKpiRefresh
  };
};
