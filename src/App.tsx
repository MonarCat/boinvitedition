
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import AuthenticatedApp from "@/pages/AuthenticatedApp";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DemoPage from "@/pages/DemoPage";
import PublicBookingPage from "@/pages/PublicBookingPage";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafetyTips from "@/pages/SafetyTips";
import NotFound from "@/pages/NotFound";
import BusinessDiscoveryPage from "@/pages/BusinessDiscoveryPage";
import { EnhancedPWAManager } from "@/components/pwa/EnhancedPWAManager";
import { useSystemDarkMode } from "@/lib/useSystemDarkMode";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors or client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  useSystemDarkMode();
  
  // Enhanced feature verification console log
  console.log('🚀 Boinvit Mobile-First PWA Loaded:', {
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: {
      '✅ Mobile-First Design': 'Bottom tabs, gestures, FAB',
      '✅ PWA Enhancements': 'Enhanced install, notifications, offline',
      '✅ Native App Experience': 'Pull-to-refresh, swipe navigation',
      '✅ Offline Capabilities': 'Data caching and sync',
      '✅ Performance Optimized': 'Lazy loading and code splitting',
      '✅ Touch Optimized': 'Tap targets and gesture support'
    },
    mobile: {
      'Bottom Navigation': 'Touch-friendly tab bar',
      'Floating Action Button': 'Quick actions for common tasks',
      'Pull to Refresh': 'Native-like refresh interaction',
      'Swipe Gestures': 'Navigate between tabs with swipes',
      'Offline Support': 'Works without internet connection'
    }
  });
  
  return (
    <>
      <SecurityHeaders />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
              },
              className: 'text-sm',
            }}
          />
          <BrowserRouter>
            <AuthProvider>
              <div className="relative min-h-screen">
                <Routes>
                  {/* Landing page as default */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  
                  {/* Business Discovery Map */}
                  <Route path="/discover" element={<BusinessDiscoveryPage />} />
                  
                  {/* QR Code booking routes - Multiple variations for reliability */}
                  <Route path="/book/:businessId" element={<PublicBookingPage />} />
                  <Route path="/booking/:businessId" element={<PublicBookingPage />} />
                  <Route path="/public-booking/:businessId" element={<PublicBookingPage />} />
                  
                  {/* Authenticated app routes */}
                  <Route path="/app/*" element={<AuthenticatedApp />} />
                  
                  {/* Legal pages */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/safety" element={<SafetyTips />} />
                  
                  {/* Legacy route redirects */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/services" element={<Navigate to="/app/services" replace />} />
                  <Route path="/booking-management" element={<Navigate to="/app/bookings" replace />} />
                  <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
                  <Route path="/staff" element={<Navigate to="/app/staff" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
                  <Route path="/subscription" element={<Navigate to="/app/subscription" replace />} />
                  
                  {/* Catch all - 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Enhanced PWA Manager */}
                <EnhancedPWAManager />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
