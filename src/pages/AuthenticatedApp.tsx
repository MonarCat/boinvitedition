
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BusinessSetup } from '@/components/dashboard/BusinessSetup';
import Dashboard from '@/pages/Dashboard';
import ServicesPage from '@/pages/ServicesPage';
import BookingManagementPage from '@/pages/BookingManagementPage';
import ClientsPage from '@/pages/ClientsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';

export const AuthenticatedApp = () => {
  const { user } = useAuth();

  // Check if user has a business
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout>
        <BusinessSetup />
      </DashboardLayout>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/bookings" element={<BookingManagementPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};
