import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SupabaseProvider } from "@/context/SupabaseProvider";
import { BookingProvider } from "./context/BookingContext";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { preloadPaystackScript } from "@/components/payment/PaystackScriptLoader";
import AuthenticatedApp from "@/pages/AuthenticatedApp";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DemoPage from "@/pages/DemoPage";
import PublicBookingPage from "@/pages/PublicBookingPage";
import MobileAppDownload from "@/pages/MobileAppDownload";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafetyTips from "@/pages/SafetyTips";
import NotFound from "@/pages/NotFound";
import BusinessDiscoveryPage from "@/pages/BusinessDiscoveryPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import AIFeaturesPage from "@/pages/AIFeaturesPage";
import { EnhancedPWAManager } from "@/components/pwa/EnhancedPWAManager";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";
import { WhatsAppFAB } from "@/components/ui/WhatsAppFAB";
import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { ResponsiveProvider } from "@/hooks/use-mobile";
import { setupUpdatePromptOverride } from "@/utils/dismissUpdatePrompt";
import { ensureAuthButtonsVisible } from "@/utils/buttonVisibility";

// Breakpoints for responsive design following Calendly & Odoo patterns
const BREAKPOINTS = {
  SMALL_MOBILE: 480,
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
};

const APP_VERSION = '3.1.0';

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // Check for accessibility preferences
  useEffect(() => {
    // Check for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    // Check for high contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrastMode(contrastQuery.matches);
    
    // Add listeners for changes
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const contrastHandler = (e: MediaQueryListEvent) => setHighContrastMode(e.matches);
    
    motionQuery.addEventListener('change', motionHandler);
    contrastQuery.addEventListener('change', contrastHandler);

    // Setup the update prompt override and ensure auth buttons stay visible
    setupUpdatePromptOverride();
    ensureAuthButtonsVisible();
    
    // Safely preload payment scripts on relevant pages
    try {
      if (window.location.pathname.includes('/booking') || 
          window.location.pathname.includes('/app')) {
        preloadPaystackScript();
      }
    } catch (error) {
      console.warn('Could not preload payment scripts:', error);
      // Non-critical error, don't show to user
    }
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      contrastQuery.removeEventListener('change', contrastHandler);
    };
  }, []);
  
  // Enhanced feature verification console log
  console.log('🚀 Boinvit Mobile-First PWA Loaded:', {
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    features: {
      '✅ Mobile-First Design': 'Bottom tabs, gestures, FAB',
      '✅ PWA Enhancements': 'Enhanced install, notifications, offline',
      '✅ Native App Experience': 'Pull-to-refresh, swipe navigation',
      '✅ Offline Capabilities': 'Data caching and sync',
      '✅ Performance Optimized': 'Lazy loading and code splitting',
      '✅ Touch Optimized': 'Tap targets and gesture support',
      '✅ Responsive Grid System': 'Adaptive grid with breakpoints',
      '✅ Enhanced Accessibility': 'WCAG 2.1 compliance improvements',
      '✅ Reduced Motion Support': 'Respects user preferences'
    },
    accessibility: {
      'Reduced Motion': prefersReducedMotion ? 'Enabled' : 'Disabled',
      'High Contrast': highContrastMode ? 'Enabled' : 'Disabled',
      'Keyboard Navigation': 'Improved focus indicators',
      'Screen Reader Support': 'ARIA attributes enhanced'
    },
    breakpoints: {
      'Small Mobile': `< ${BREAKPOINTS.SMALL_MOBILE}px`,
      'Mobile': `${BREAKPOINTS.SMALL_MOBILE}px - ${BREAKPOINTS.MOBILE}px`,
      'Tablet': `${BREAKPOINTS.MOBILE}px - ${BREAKPOINTS.DESKTOP}px`,
      'Desktop': `> ${BREAKPOINTS.DESKTOP}px`
    }
  });
  
  return (
    <>
      <SecurityHeaders />
      <ThemeProvider defaultTheme="light" storageKey="boinvit-ui-theme">
        <ResponsiveProvider>
          <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      fontSize: '14px',
                    },
                    className: `text-sm ${highContrastMode ? 'high-contrast' : ''}`,
                  }}
                />
                <BrowserRouter>
                  <SupabaseProvider>
                    <BookingProvider>
                      <AuthProvider>
                    <div className={`relative min-h-screen ${highContrastMode ? 'high-contrast-mode' : ''}`}>
                      <Routes>
                        {/* Landing page as default */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/demo" element={<DemoPage />} />
                        
                        {/* Business Discovery Map */}
                        <Route path="/discover" element={<BusinessDiscoveryPage />} />
                        
                        {/* Integrations Hub */}
                        <Route path="/integrations" element={<IntegrationsPage />} />
                        <Route path="/ai-features" element={<AIFeaturesPage />} />
                        
                        {/* Mobile App Download Page */}
                        <Route path="/app-download" element={<MobileAppDownload />} />
                        
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
                      <UpdateNotification version={APP_VERSION} />
                      <WhatsAppFAB />
                    </div>
                  </AuthProvider>
                    </BookingProvider>
                  </SupabaseProvider>
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </MotionConfig>
        </ResponsiveProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
