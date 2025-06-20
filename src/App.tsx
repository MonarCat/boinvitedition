
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import PWAStatus from '@/components/pwa/PWAStatus';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { NetworkStatus } from '@/components/ui/network-status';
import AuthenticatedApp from '@/pages/AuthenticatedApp';
import Index from '@/pages/Index';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import DemoPage from '@/pages/DemoPage';
import BusinessDiscoveryPage from '@/pages/BusinessDiscoveryPage';
import PublicBookingPage from '@/pages/PublicBookingPage';
import BusinessSlugResolver from '@/components/business/BusinessSlugResolver';
import SafetyTips from '@/pages/SafetyTips';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiePolicy from '@/pages/CookiePolicy';
import NotFound from '@/pages/NotFound';
import FirstAdminPage from '@/pages/FirstAdminPage';
import Dashboard from '@/pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Static Routes - These must come FIRST before any dynamic routes */}
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/discover" element={<BusinessDiscoveryPage />} />
                
                {/* Authentication Routes - CRITICAL: These must come before /:slug */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                
                {/* Dashboard Route - Must come before /:slug */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Booking Routes */}
                <Route path="/book/:businessId" element={<PublicBookingPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/first-setup" element={<FirstAdminPage />} />
                
                {/* App Routes */}
                <Route path="/app/*" element={<AuthenticatedApp />} />
                
                {/* Legal Pages */}
                <Route path="/safety-tips" element={<SafetyTips />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                
                {/* Business Slug Route - This MUST come after all static routes */}
                <Route path="/:slug" element={<BusinessSlugResolver />} />
                
                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <Toaster />
              <PWAStatus />
              <InstallPrompt />
              <NetworkStatus />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
