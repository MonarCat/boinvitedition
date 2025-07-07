import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface BusinessData {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const useDashboardRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(Date.now());
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const refreshAll = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    toast.info('Refreshing dashboard data...');

    try {
      // Get businessId if available
      const businessData = queryClient.getQueryData(['current-business', user?.id]) as BusinessData | undefined;
      const businessId = businessData?.id;

      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-business', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['business-data'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: ['staff'] }),
      ]);

      // If we have a business ID, invalidate business-specific queries
      if (businessId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['business-data', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['bookings', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['payments', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['clients', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['services', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['staff', businessId] }),
          queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] }),
        ]);
      }
      
      // Update last refresh time
      setLastRefreshTime(Date.now());
      toast.success('Dashboard data refreshed!');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      toast.error('Failed to refresh some data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshAll,
    isRefreshing,
    lastRefreshTime,
  };
};