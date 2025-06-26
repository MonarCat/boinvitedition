import React, { useState } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardExportSection } from '@/components/dashboard/DashboardExportSection';
import { DashboardStaffSection } from '@/components/dashboard/DashboardStaffSection';
import { DashboardQRSection } from '@/components/dashboard/DashboardQRSection';
import { DashboardSecuritySection } from '@/components/dashboard/DashboardSecuritySection';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';

const Dashboard = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light'); // Default to light theme

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
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get dashboard handlers
  const {
    handleNewBooking,
    handleCreateInvoice,
    handleViewClients,
    handleManageServices,
    handleUpdateSettings,
    handleSubscription,
  } = useDashboardHandlers();

  console.log('Dashboard loaded with clean QR code system:', {
    business: business?.id, 
    user: user?.id,
    theme,
    qrGenerator: 'QRCodeGenerator (refactored)'
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader 
          business={business}
          theme={theme}
          setTheme={setTheme}
          onNewBooking={handleNewBooking}
        />
        
        <DashboardStats 
          business={business}
          onEditBusiness={handleUpdateSettings}
        />
        
        {/* Quick Actions with Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardQuickActions 
            onNewBooking={handleNewBooking}
            onCreateInvoice={handleCreateInvoice}
            onViewClients={handleViewClients}
            onManageServices={handleManageServices}
            onSubscription={handleSubscription}
            onUpdateSettings={handleUpdateSettings}
          />
          
          {business && (
            <>
              <DashboardExportSection businessId={business.id} />
              <DashboardStaffSection />
            </>
          )}
        </div>

        {/* QR Code Section */}
        <DashboardQRSection business={business} />

        {/* Enhanced Security Dashboard Section */}
        <DashboardSecuritySection />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
