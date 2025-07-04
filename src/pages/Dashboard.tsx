
import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BusinessDashboard } from '@/components/dashboard/BusinessDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { EnhancedRealtimeStatus } from '@/components/dashboard/EnhancedRealtimeStatus';
import { RealtimeMonitor } from '@/components/dashboard/RealtimeMonitor';

const Dashboard = () => {
  const { user } = useAuth();
  const { monitorBusinessAccess } = useSecurityMonitoring();

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
        // Log potential unauthorized access attempt
        await monitorBusinessAccess('unknown', 'fetch_business', false);
        throw error;
      }
      // Log successful business access
      await monitorBusinessAccess(data.id, 'fetch_business', true);
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{business?.name || 'Business Dashboard'}</h1>
        </div>
        
        {/* Enhanced Real-Time Status */}
        {business && (
          <div className="mb-6">
            <EnhancedRealtimeStatus businessId={business.id} />
          </div>
        )}
        
        <BusinessDashboard />
        
        {business && (
          <div className="mt-8">
            <RealtimeMonitor businessId={business.id} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
