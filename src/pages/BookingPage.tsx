import { useState } from "react";
import { useParams } from "react-router-dom";
import { PaymentReceipt } from "@/components/payment/PaymentReceipt";
import { useClientPayments } from "@/hooks/useClientPayments";
import { MobileBookingHeader } from "@/components/booking/MobileBookingHeader";
import { EnhancedBusinessHeader } from "@/components/booking/EnhancedBusinessHeader";
import { ServiceSelectionCard } from "@/components/booking/ServiceSelectionCard";
import { DateTimeSelectionCard } from "@/components/booking/DateTimeSelectionCard";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import { ClientInformationCard } from "@/components/booking/ClientInformationCard";
import { CleanBookingLayout } from "@/components/booking/CleanBookingLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DirectBusinessPayment } from "@/components/payment/DirectBusinessPayment";
import { supabase } from "@/integrations/supabase/client";

interface BookingDetails {
  id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  payment_reference: string;
}

const BookingPage = () => {
  const { businessId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const { services, business, servicesLoading } = useClientPayments(
    businessId || ""
  );

  const handleProceedToPayment = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all fields before proceeding.");
      return;
    }

    setIsProcessing(true);
    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (!selectedServiceData || !business || !selectedDate) {
      toast.error("Could not find booking details. Please try again.");
      setIsProcessing(false);
      return;
    }

    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: business.id,
        service_id: selectedServiceData.id,
        customer_name: clientName,
        customer_email: clientEmail,
        customer_phone: clientPhone,
        booking_date: selectedDate.toISOString().split("T")[0],
        booking_time: selectedTime,
        status: "pending",
        total_amount: selectedServiceData.price,
        duration_minutes: selectedServiceData.duration_minutes,
        client_id: null, // Assuming guest booking
      })
      .select("id")
      .single();

    if (bookingError || !newBooking) {
      console.error("Error creating pending booking:", bookingError);
      toast.error("Could not initiate booking. Please try again.");
      setIsProcessing(false);
      return;
    }

    setPendingBookingId(newBooking.id);
    setShowPayment(true);
    setIsProcessing(false);
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!pendingBookingId) {
      toast.error(
        "Critical error: Booking ID missing after payment. Please contact support."
      );
      return;
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_reference: reference,
        payment_method: "paystack",
      })
      .eq("id", pendingBookingId);

    if (updateError) {
      console.error("Error confirming booking:", updateError);
      toast.error(
        "Payment successful, but failed to confirm your booking. Please contact support."
      );
      return;
    }

    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (!selectedServiceData || !business || !selectedDate) {
      toast.error(
        "Critical error: Booking details lost after payment. Please contact support."
      );
      return;
    }

    const bookingData: BookingDetails = {
      id: pendingBookingId,
      service_name: selectedServiceData.name,
      booking_date: selectedDate.toISOString(),
      booking_time: selectedTime,
      total_amount: selectedServiceData.price,
      currency: business.currency || "KES",
      payment_reference: reference,
      customer_name: clientName,
      customer_email: clientEmail,
    };
    setBookingDetails(bookingData);
    setPaymentCompleted(true);
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
    toast.error(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  const handleReceiptClose = () => {
    setPaymentCompleted(false);
    // Reset form
    setSelectedDate(undefined);
    setSelectedService("");
    setSelectedTime("");
    setClientEmail("");
    setClientName("");
    setClientPhone("");
    setBookingDetails(null);
    setPendingBookingId(null);
  };

  const isFormValid =
    selectedService &&
    selectedDate &&
    selectedTime &&
    clientEmail &&
    clientName &&
    clientPhone;

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black flex flex-col items-center justify-center text-slate-700 dark:text-slate-300">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-lg font-semibold">Loading business details...</p>
        <p className="text-sm">Please wait a moment.</p>
      </div>
    );
  }

  if (paymentCompleted && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black flex items-center justify-center p-4 md:p-6">
        <PaymentReceipt booking={bookingDetails} onClose={handleReceiptClose} />
      </div>
    );
  }

  if (showPayment) {
    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (!selectedServiceData || !business) {
      toast.error("Required payment details are missing.");
      setShowPayment(false);
      return null;
    }

    return (
      <CleanBookingLayout>
        <div className="max-w-2xl mx-auto py-8">
          <DirectBusinessPayment
            businessId={business.id}
            businessName={business.name}
            amount={selectedServiceData.price}
            currency={business.currency || "KES"}
            bookingId={pendingBookingId || undefined}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </CleanBookingLayout>
    );
  }

  const BookingContent = () => (
    <div className="space-y-8">
      {business && (
        <EnhancedBusinessHeader business={business} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ServiceSelectionCard
            services={services}
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
            business={business}
          />

          <DateTimeSelectionCard
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />
        </div>

        <div className="space-y-8 lg:sticky lg:top-8">
          <BookingSummaryCard
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            services={services}
            business={business}
          />

          <ClientInformationCard
            clientName={clientName}
            clientEmail={clientEmail}
            clientPhone={clientPhone}
            onNameChange={setClientName}
            onEmailChange={setClientEmail}
            onPhoneChange={setClientPhone}
            onSubmit={handleProceedToPayment}
            isValid={!!isFormValid}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );

  return (
    <CleanBookingLayout>
      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileBookingHeader business={business}>
          <BookingContent />
        </MobileBookingHeader>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <BookingContent />
      </div>
    </CleanBookingLayout>
  );
};

export default BookingPage;
