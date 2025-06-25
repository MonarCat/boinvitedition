
import React, { useState } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardKPISection } from '@/components/dashboard/DashboardKPISection';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReliableQRGenerator } from '@/components/qr/ReliableQRGenerator';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { ExportButton } from '@/components/ui/ExportButton';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { QrCode, Download, Shield, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('system');

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

  // Get dashboard data and stats
  const {
    stats,
    currency,
    formatPrice,
    handleKpiRefresh,
    timePeriod,
    setTimePeriod,
  } = useDashboardData(business?.id);

  // Get dashboard handlers
  const {
    handleNewBooking,
    handleCreateInvoice,
    handleViewClients,
    handleManageServices,
    handleUpdateSettings,
    handleSubscription,
  } = useDashboardHandlers();

  const { isExporting, exportBookings, exportClients, exportStaff } = useSpreadsheetExport(business?.id || '');

  console.log('Dashboard loaded with business:', business?.id, 'user:', user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader 
          business={business}
          theme={theme}
          setTheme={setTheme}
          onNewBooking={handleNewBooking}
        />
        <DashboardKPISection 
          business={business}
          stats={stats}
          currency={currency}
          formatPrice={formatPrice}
          onRefresh={handleKpiRefresh}
          onEditBusiness={handleUpdateSettings}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
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
              {/* Export Data Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ExportButton
                    onExport={exportBookings}
                    isExporting={isExporting}
                    label="Bookings"
                  />
                  <ExportButton
                    onExport={exportClients}
                    isExporting={isExporting}
                    label="Clients"
                  />
                  <ExportButton
                    onExport={exportStaff}
                    isExporting={isExporting}
                    label="Staff"
                  />
                </CardContent>
              </Card>

              {/* Staff Management Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Staff Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/app/staff'}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Staff
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/app/staff-attendance'}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Staff Attendance
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* QR Code Section - Using ReliableQRGenerator */}
        {business && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Service Booking QR Code
              </CardTitle>
              <p className="text-sm text-gray-600">
                Display this QR code for customers to easily book your services
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ReliableQRGenerator 
                  businessId={business.id} 
                  businessName={business.name || 'Your Business'}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Dashboard Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityDashboard />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
