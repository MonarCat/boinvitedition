import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import ServicesPage from '@/pages/ServicesPage';
import BookingManagementPage from '@/pages/BookingManagementPage';
import ClientsPage from '@/pages/ClientsPage';
import StaffPage from '@/pages/StaffPage';
import InvoicesPage from '@/pages/InvoicesPage';
import FinancePage from '@/pages/FinancePage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import StaffDashboardPage from '@/pages/StaffDashboardPage';
import StaffAttendancePage from '@/pages/StaffAttendancePage';
import BusinessDiscoveryPage from '@/pages/BusinessDiscoveryPage';
import OnboardingPage from '@/pages/OnboardingPage';
import NotFound from '@/pages/NotFound';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Loader2 } from 'lucide-react';

const AuthenticatedApp = () => {
  const { needsOnboarding, isLoading } = useOnboardingStatus();

  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Onboarding route */}
      <Route path="onboarding" element={<OnboardingPage />} />
      
      {/* If onboarding needed, redirect to onboarding */}
      {needsOnboarding && (
        <Route path="*" element={<Navigate to="onboarding" replace />} />
      )}
      
      {/* Default route - redirect to dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      
      {/* Main app routes */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="bookings" element={<BookingManagementPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="staff" element={<StaffPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="finance" element={<FinancePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="admin" element={<AdminPage />} />
      <Route path="staff-dashboard" element={<StaffDashboardPage />} />
      <Route path="staff-attendance" element={<StaffAttendancePage />} />
      <Route path="discover" element={<BusinessDiscoveryPage />} />
      
      {/* Catch all for unmatched routes within /app */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedApp;
