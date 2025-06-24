
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import InvoicesPage from "./pages/InvoicesPage";
import { ClientBookingsPage } from "./components/booking/ClientBookingsPage";
import { PaymentSuccessPage } from "./components/payment/PaymentSuccessPage";
import AuthPage from "./pages/AuthPage";
import AuthenticatedApp from "./pages/AuthenticatedApp";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/booking/:businessId" element={<BookingPage />} />
      <Route path="/book/:businessId" element={<PublicBookingPage />} />
      <Route path="/bookings" element={<ClientBookingsPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      
      {/* Authenticated app routes */}
      {user && <Route path="/app/*" element={<AuthenticatedApp />} />}
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
