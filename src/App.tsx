
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useSystemDarkMode } from "@/lib/useSystemDarkMode";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";

// Lazy load major components
const AuthenticatedApp = lazy(() => import("@/pages/AuthenticatedApp").then(module => ({ default: module.AuthenticatedApp })));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const PublicBookingPage = lazy(() => import("@/pages/PublicBookingPage"));
const BusinessDiscoveryPage = lazy(() => import("@/pages/BusinessDiscoveryPage"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const SafetyTips = lazy(() => import("@/pages/SafetyTips"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Eager load small components
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PWAStatus from "@/components/pwa/PWAStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const App = () => {
  useSystemDarkMode();
  return (
    <AppErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <AuthProvider>
                <div className="relative">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/demo" element={<DemoPage />} />
                      <Route path="/discover" element={<BusinessDiscoveryPage />} />
                      <Route path="/app/*" element={<AuthenticatedApp />} />
                      <Route path="/booking/:businessId" element={<PublicBookingPage />} />
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
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  
                  <InstallPrompt />
                  <div className="fixed top-4 right-4 z-40">
                    <PWAStatus />
                  </div>
                </div>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </AppErrorBoundary>
  );
};

export default App;
