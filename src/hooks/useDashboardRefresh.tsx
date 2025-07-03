import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to provide a manual refresh function for dashboard stats
 * Useful when automatic invalidation might not be working as expected
 */
export const useDashboardRefresh = (businessId?: string) => {
  const queryClient = useQueryClient();
  
  /**
   * Force refresh all dashboard-related queries
   */
  const refreshDashboard = async () => {
    if (!businessId) {
      console.warn('No businessId provided to useDashboardRefresh');
      return;
    }
    
    try {
      // Show toast to indicate refresh is happening
      toast.info('Refreshing dashboard data...', {
        id: 'dashboard-refresh',
        duration: 2000,
      });
      
      console.log('Manually refreshing dashboard data for business:', businessId);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['bookings-list', businessId] });
      queryClient.invalidateQueries({ queryKey: ['clients', businessId] });
      queryClient.invalidateQueries({ queryKey: ['staff', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
      
      // Force fetch some key data to ensure fresh state
      await Promise.all([
        // Fetch latest bookings
        supabase
          .from('bookings')
          .select('id')
          .eq('business_id', businessId)
          .limit(1),
          
        // Fetch latest clients  
        supabase
          .from('clients')
          .select('id')
          .eq('business_id', businessId)
          .limit(1),
          
        // Fetch latest payments
        supabase
          .from('payment_transactions')
          .select('id')
          .eq('business_id', businessId)
          .limit(1)
      ]);
      
      // Update toast to show success
      toast.success('Dashboard refreshed', {
        id: 'dashboard-refresh',
        duration: 2000,
      });
      
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Error refreshing dashboard', {
        id: 'dashboard-refresh',
      });
    }
  };
  
  return {
    refreshDashboard,
  };
};
