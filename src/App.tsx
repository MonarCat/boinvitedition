import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/lib/ThemeProvider";

// Production Pages
import ProductionAuthPage from "./pages/ProductionAuthPage";
import ProductionOnboardingPage from "./pages/ProductionOnboardingPage";
import QRScannerPage from "./pages/QRScannerPage";
import LandingPage from "./pages/LandingPage";

// Existing Pages
import Dashboard from "./pages/Dashboard";
import ServicesPage from "./pages/ServicesPage";
import BookingManagementPage from "./pages/BookingManagementPage";
import ClientsPage from "./pages/ClientsPage";
import StaffPage from "./pages/StaffPage";
import InvoicesPage from "./pages/InvoicesPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BusinessDiscoveryPage from "./pages/BusinessDiscoveryPage";

// Other Pages
import AuthPage from "./pages/AuthPage";
import AuthenticatedApp from "./pages/AuthenticatedApp";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import SafetyTips from "./pages/SafetyTips";
import NotFound from "./pages/NotFound";

// Production WhatsApp Button
import { ProductionWhatsAppButton } from "./components/ui/ProductionWhatsAppButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={
                    <PublicRoute>
                      <ProductionAuthPage />
                    </PublicRoute>
                  } />
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <ProductionOnboardingPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* QR Scanner */}
                  <Route path="/scan" element={<QRScannerPage />} />
                  
                  {/* Public Booking */}
                  <Route path="/book/:businessId" element={<PublicBookingPage />} />
                  <Route path="/discover" element={<BusinessDiscoveryPage />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <ServicesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings" element={
                    <ProtectedRoute>
                      <BookingManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <ClientsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/staff" element={
                    <ProtectedRoute>
                      <StaffPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/invoices" element={
                    <ProtectedRoute>
                      <InvoicesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Legacy Routes */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/app" element={<AuthenticatedApp />} />
                  
                  {/* Legal Pages */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/safety" element={<SafetyTips />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Global WhatsApp Button */}
                <ProductionWhatsAppButton />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
