
import React, { useState, lazy } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardKPISection } from '@/components/dashboard/DashboardKPISection';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DataRefreshPanel } from '@/components/dashboard/DataRefreshPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { ExportButton } from '@/components/ui/ExportButton';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { useBookingsRealtime } from '@/hooks/useBookingsRealtime';
import { SimpleRealtimeStatus } from '@/components/dashboard/SimpleRealtimeStatus';
import { useSimpleRealtime } from '@/hooks/useSimpleRealtime';
import { RealtimeMonitor } from '@/components/dashboard/RealtimeMonitor';
import { BusinessCreateBookingModal } from '@/components/booking/BusinessCreateBookingModal';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Download, Shield, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('system');
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const { monitorDataExport, monitorBusinessAccess } = useSecurityMonitoring();

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
    showCreateBookingModal,
    setShowCreateBookingModal,
    navigate,
  } = useDashboardHandlers();

  // Set up simple real-time updates using direct Supabase channels
  const {
    isConnected,
    error: realtimeError,
    forceReconnect: reconnect
  } = useSimpleRealtime({
    businessId: business?.id || '',
    showToasts: true
  });
  
  // Debounce reconnection attempts to prevent multiple clicks
  const forceReconnect = useDebouncedCallback(() => {
    reconnect();
  }, 2000);

  const { isExporting, exportBookings, exportClients, exportStaff } = useSpreadsheetExport(business?.id || '');

  // Enhanced export functions with security monitoring
  const secureExportBookings = async () => {
    await monitorDataExport('bookings', stats?.totalBookings || 0, business?.id);
    return exportBookings();
  };

  const secureExportClients = async () => {
    await monitorDataExport('clients', stats?.totalClients || 0, business?.id);
    return exportClients();
  };

  const secureExportStaff = async () => {
    await monitorDataExport('staff', stats?.totalStaff || 0, business?.id);
    return exportStaff();
  };

  console.log('Dashboard loaded with business:', business?.id, 'user:', user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader 
          business={business}
          theme={theme}
          setTheme={setTheme}
          onNewBooking={handleNewBooking}
          isConnected={isConnected}
          connectionError={realtimeError}
          onReconnect={forceReconnect}
        />
        
        {/* Add Data Refresh Panel for better syncing */}
        {business?.id && <DataRefreshPanel businessId={business.id} />}
        
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
        
        {/* Updated DashboardTabs with business data and navigate function */}
        <DashboardTabs
          handleCreateInvoice={handleCreateInvoice}
          handleViewClients={handleViewClients}
          handleUpdateSettings={handleUpdateSettings}
          handleManageServices={handleManageServices}
          handleSubscription={handleSubscription}
          currency={currency}
          navigate={navigate}
          showEditBusiness={showEditBusiness}
          setShowEditBusiness={setShowEditBusiness}
          business={business}
        />

        {/* Quick Actions with Secure Export Buttons */}
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
              {/* Export Data Card with Security Monitoring */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ExportButton
                    onExport={secureExportBookings}
                    isExporting={isExporting}
                    label="Bookings"
                  />
                  <ExportButton
                    onExport={secureExportClients}
                    isExporting={isExporting}
                    label="Clients"
                  />
                  <ExportButton
                    onExport={secureExportStaff}
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

        {/* Enhanced Security Dashboard Section */}
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

        {/* New Simple Realtime Monitor */}
        {business && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Realtime Activity Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Import the new realtime monitor component */}
              <React.Suspense fallback={<div>Loading realtime monitor...</div>}>
                <RealtimeMonitor businessId={business.id} />
              </React.Suspense>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Modal for creating a booking for a walk-in client */}
      {business && (
        <BusinessCreateBookingModal
          isOpen={showCreateBookingModal}
          onClose={() => setShowCreateBookingModal(false)}
          businessId={business.id}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
