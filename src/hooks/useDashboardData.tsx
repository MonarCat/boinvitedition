
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    case 'today':
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
      break;
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      break;
    default:
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
  }

  return { startDate, endDate };
};

export const useDashboardData = (businessId?: string) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');

  // Get business data
  const { data: business } = useQuery({
    queryKey: ['business-data', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const actualBusinessId = businessId || business?.id;

  // Get dashboard statistics with time period filtering
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', actualBusinessId, timePeriod],
    queryFn: async () => {
      if (!actualBusinessId) return {
        activeBookings: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalClients: 0,
      };

      const { startDate, endDate } = getDateRange(timePeriod);

      // Get bookings for the period (including paid bookings)
      const { data: periodBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', actualBusinessId)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .in('status', ['confirmed', 'completed'])
        .neq('payment_status', 'pending');

      // Get revenue from completed payments - use payment_transactions for accuracy
      const { data: paymentTransactions } = await supabase
        .from('payment_transactions')
        .select('amount, created_at')
        .eq('business_id', actualBusinessId)
        .eq('status', 'completed')
        .eq('transaction_type', 'client_to_business')
        .gte('created_at', startDate + 'T00:00:00Z')
        .lte('created_at', endDate + 'T23:59:59Z');

      // Also get revenue from client_business_transactions for backup
      const { data: clientTransactions } = await supabase
        .from('client_business_transactions')
        .select('business_amount, created_at')
        .eq('business_id', actualBusinessId)
        .eq('status', 'completed')
        .gte('created_at', startDate + 'T00:00:00Z')
        .lte('created_at', endDate + 'T23:59:59Z');

      // Get total clients (unique by email to avoid duplicates)
      const { data: clients } = await supabase
        .from('clients')
        .select('id, email')
        .eq('business_id', actualBusinessId);

      // Calculate revenue from both sources
      const transactionRevenue = paymentTransactions?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0;
      const clientTransactionRevenue = clientTransactions?.reduce((sum, tx) => sum + Number(tx.business_amount || 0), 0) || 0;
      
      // Use the higher value or sum them if they represent different things
      const totalRevenue = Math.max(transactionRevenue, clientTransactionRevenue);

      // Get unique client count (deduplicate by email)
      const uniqueEmails = new Set(clients?.map(c => c.email) || []);
      const totalClients = uniqueEmails.size;

      return {
        activeBookings: periodBookings?.length || 0,
        totalRevenue,
        totalBookings: periodBookings?.length || 0,
        totalClients,
      };
    },
    enabled: !!actualBusinessId,
    staleTime: 30000, // 30 seconds - refresh more frequently for real-time updates
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Get currency from business data
  const currency = business?.currency || 'KES';

  // Format price function using the centralized utility
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Handle KPI refresh
  const handleKpiRefresh = () => {
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
  };
};
