
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { ThemeProvider } from "@/lib/ThemeProvider";
import AuthenticatedApp from "@/pages/AuthenticatedApp";
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import PublicBookingPage from "@/pages/PublicBookingPage";
import BusinessDiscoveryPage from "@/pages/BusinessDiscoveryPage";
import DemoPage from "@/pages/DemoPage";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafetyTips from "@/pages/SafetyTips";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <SecurityHeaders />
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Toaster />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/book/:businessId" element={<PublicBookingPage />} />
                  <Route path="/businesses" element={<BusinessDiscoveryPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/safety" element={<SafetyTips />} />
                  
                  {/* Authenticated app routes */}
                  <Route path="/app/*" element={<AuthenticatedApp />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
