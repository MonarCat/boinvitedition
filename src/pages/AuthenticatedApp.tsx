
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import ServicesPage from '@/pages/ServicesPage';
import BookingManagementPage from '@/pages/BookingManagementPage';
import ClientsPage from '@/pages/ClientsPage';
import StaffPage from '@/pages/StaffPage';
import InvoicesPage from '@/pages/InvoicesPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import StaffDashboardPage from '@/pages/StaffDashboardPage';
import StaffAttendancePage from '@/pages/StaffAttendancePage';
import BusinessDiscoveryPage from '@/pages/BusinessDiscoveryPage';
import PublicBookingPage from '@/pages/PublicBookingPage';
import NotFound from '@/pages/NotFound';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Default route - redirect to dashboard */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Main app routes */}
      <Route path="/app/dashboard" element={<Dashboard />} />
      <Route path="/app/services" element={<ServicesPage />} />
      <Route path="/app/bookings" element={<BookingManagementPage />} />
      <Route path="/app/clients" element={<ClientsPage />} />
      <Route path="/app/staff" element={<StaffPage />} />
      <Route path="/app/invoices" element={<InvoicesPage />} />
      <Route path="/app/settings" element={<SettingsPage />} />
      <Route path="/app/subscription" element={<SubscriptionPage />} />
      <Route path="/app/staff-dashboard" element={<StaffDashboardPage />} />
      <Route path="/app/staff-attendance" element={<StaffAttendancePage />} />
      <Route path="/app/discover" element={<BusinessDiscoveryPage />} />
      
      {/* Public booking routes - these should work without /app prefix */}
      <Route path="/book/:businessId" element={<PublicBookingPage />} />
      <Route path="/booking/:businessId" element={<PublicBookingPage />} />
      
      {/* Default fallback for /app routes */}
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedApp;
