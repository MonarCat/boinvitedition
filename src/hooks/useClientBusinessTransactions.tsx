
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientBusinessTransactions = (businessId?: string) => {
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['client-business-transactions', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('client_business_transactions')
        .select(`
          *,
          businesses(name, currency),
          bookings(booking_date, booking_time, services(name))
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const { data: payoutSettings } = useQuery({
    queryKey: ['business-payout-settings', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const getTotalRevenue = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);
  };

  const getPendingAmount = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);
  };

  return {
    transactions: transactions || [],
    payoutSettings,
    isLoading,
    refetch,
    totalRevenue: getTotalRevenue(),
    pendingAmount: getPendingAmount(),
  };
};
