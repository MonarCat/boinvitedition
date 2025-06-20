
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeProvider";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import ServicesPage from "./pages/ServicesPage";
import StaffPage from "./pages/StaffPage";
import ClientsPage from "./pages/ClientsPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import InvoicesPage from "./pages/InvoicesPage";
import BookingManagementPage from "./pages/BookingManagementPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffAttendancePage from "./pages/StaffAttendancePage";
import BusinessDiscoveryPage from "./pages/BusinessDiscoveryPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import ProductionCheckPage from "./pages/ProductionCheckPage";
import AuthenticatedApp from "./pages/AuthenticatedApp";
import AdminPage from "./pages/AdminPage";
import FirstAdminPage from "./pages/FirstAdminPage";
import DemoPage from "./pages/DemoPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import SafetyTips from "./pages/SafetyTips";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/book/:businessId" element={<PublicBookingPage />} />
              <Route path="/discover" element={<BusinessDiscoveryPage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/safety" element={<SafetyTips />} />
              <Route path="/admin-setup" element={<FirstAdminPage />} />
              
              {/* Protected routes */}
              <Route path="/app/*" element={<AuthenticatedApp />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="bookings" element={<BookingPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="booking-management" element={<BookingManagementPage />} />
                <Route path="staff-dashboard" element={<StaffDashboardPage />} />
                <Route path="staff-attendance" element={<StaffAttendancePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="production-check" element={<ProductionCheckPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
