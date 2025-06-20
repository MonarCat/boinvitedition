
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { PWAStatus } from '@/components/pwa/PWAStatus';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
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
        <ThemeProvider defaultTheme="light" storageKey="app-theme">
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Main App Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/discover" element={<BusinessDiscoveryPage />} />
                <Route path="/book/:businessId" element={<PublicBookingPage />} />
                <Route path="/app/*" element={<AuthenticatedApp />} />
                <Route path="/admin/first-setup" element={<FirstAdminPage />} />
                
                {/* Legal Pages */}
                <Route path="/safety-tips" element={<SafetyTips />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                
                {/* Business Slug Route - This should come last to catch business slugs */}
                <Route path="/:slug" element={<BusinessSlugResolver />} />
                
                {/* 404 Page */}
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
