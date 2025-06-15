import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PWAStatus from "@/components/pwa/PWAStatus";
import BusinessDiscoveryPage from "@/pages/BusinessDiscoveryPage";
import { useSystemDarkMode } from "@/lib/useSystemDarkMode";

const queryClient = new QueryClient();

const App = () => {
  useSystemDarkMode(); // Enable auto dark mode
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <div className="relative">
              <Routes>
                {/* Landing page as default */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/demo" element={<DemoPage />} />
                
                {/* Business Discovery Map */}
                <Route path="/discover" element={<BusinessDiscoveryPage />} />
                
                {/* Public booking - primary global route for QR codes */}
                <Route path="/public-booking/:businessId" element={<PublicBookingPage />} />
                
                {/* Authenticated app routes */}
                <Route path="/app/*" element={<AuthenticatedApp />} />
                
                {/* Legacy public booking route - redirect to new route */}
                <Route path="/booking/:businessId" element={<PublicBookingPage />} />
                
                {/* Legal pages */}
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/safety" element={<SafetyTips />} />
                
                {/* Legacy route redirects - redirect to app paths */}
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/services" element={<Navigate to="/app/services" replace />} />
                <Route path="/booking-management" element={<Navigate to="/app/bookings" replace />} />
                <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
                <Route path="/staff" element={<Navigate to="/app/staff" replace />} />
                <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
                <Route path="/subscription" element={<Navigate to="/app/subscription" replace />} />
                
                {/* Catch all - redirect to landing page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* PWA Components */}
              <InstallPrompt />
              <div className="fixed top-4 right-4 z-40">
                <PWAStatus />
              </div>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
