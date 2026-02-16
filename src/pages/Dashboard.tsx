import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BusinessDashboard } from '@/components/dashboard/BusinessDashboard';
import { DetailedBookingList } from '@/components/booking/DetailedBookingList';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';
import { useRealtimeBookingNotifications } from '@/hooks/useRealtimeBookingNotifications';
import { PlatformBalanceBanner } from '@/components/platform/PlatformBalanceBanner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { monitorBusinessAccess } = useSecurityMonitoring();
  const { lastRefreshTime, refreshAll, isRefreshing } = useDashboardRefresh();

  // Get the business for the logged-in user
  const { data: business } = useQuery({
    queryKey: ['current-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) {
        await monitorBusinessAccess('unknown', 'fetch_business', false);
        throw error;
      }
      await monitorBusinessAccess(data.id, 'fetch_business', true);
      return data;
    },
    enabled: !!user?.id,
  });

  // Set up real-time booking notifications for the business
  const { 
    isListening, 
    hasNotifications, 
    clearNotifications 
  } = useRealtimeBookingNotifications(business?.id);

  // Auto-refresh data when notifications come in
  React.useEffect(() => {
    if (hasNotifications) {
      // Auto-refresh when new notifications arrive
      refreshAll();
      clearNotifications();
    }
  }, [hasNotifications, refreshAll, clearNotifications]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Header with Business Info */}
        <DashboardHeader 
          title={business?.name || 'Business Dashboard'}
          subtitle="Welcome to your business dashboard"
          onRefresh={refreshAll}
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime}
          hasSearch={true}
          onSearch={(query) => console.log("Search:", query)}
          badge={isListening ? { variant: "success", text: "Real-time updates active" } : undefined}
        />
        
        {/* Platform Balance Banner - shows when balance is high or account is restricted */}
        {business?.id && (
          <PlatformBalanceBanner businessId={business.id} />
        )}
        
        {/* Realtime Status Indicator */}
        {business?.id && (
          <div className="mb-6">
            <RealtimeDashboard businessId={business.id} />
          </div>
        )}
        
        {/* Main Business Dashboard */}
        <BusinessDashboard />
        
        {/* Detailed Upcoming Bookings Section */}
        {business?.id && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailedBookingList 
                  businessId={business.id} 
                  showOnlyUpcoming={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
