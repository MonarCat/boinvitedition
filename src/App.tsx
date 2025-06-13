
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/AuthPage';
import SettingsPage from '@/pages/SettingsPage';
import { AuthenticatedApp } from '@/pages/AuthenticatedApp';
import AdminPage from '@/pages/AdminPage';
import FirstAdminPage from '@/pages/FirstAdminPage';
import NotFound from '@/pages/NotFound';
import DemoPage from '@/pages/DemoPage';
import BookingManagementPage from '@/pages/BookingManagementPage';
import ServicesPage from '@/pages/ServicesPage';
import ClientsPage from '@/pages/ClientsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import PublicBookingPage from '@/pages/PublicBookingPage';

// Create a client instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/book/:subdomain" element={<PublicBookingPage />} />
            {/* Authenticated Routes */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <AuthenticatedApp />
                </RequireAuth>
              }
            />
            <Route
              path="/booking-management"
              element={
                <RequireAuth>
                  <BookingManagementPage />
                </RequireAuth>
              }
            />
            <Route
              path="/services"
              element={
                <RequireAuth>
                  <ServicesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/clients"
              element={
                <RequireAuth>
                  <ClientsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices"
              element={
                <RequireAuth>
                  <InvoicesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/subscription"
              element={
                <RequireAuth>
                  <SubscriptionPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/setup-admin" element={<FirstAdminPage />} />
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default App;
