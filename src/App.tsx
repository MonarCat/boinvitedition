
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import InvoicesPage from "./pages/InvoicesPage";
import { ClientBookingsPage } from "./components/booking/ClientBookingsPage";
import { PaymentSuccessPage } from "./components/payment/PaymentSuccessPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/booking/:businessId" element={<BookingPage />} />
              <Route path="/book/:businessId" element={<PublicBookingPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/bookings" element={<ClientBookingsPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
