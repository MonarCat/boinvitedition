import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { DirectPaystackPayment } from './DirectPaystackPayment';
import { loadPaystackScript } from './PaystackScriptLoader';

interface ClientToBusinessPaymentProps {
  businessId: string;
  businessName: string;
  amount: number;
  currency: string;
  bookingId?: string;
  bookingDetails?: {
    serviceId?: string;
    serviceName: string;
    date?: string;
    time?: string;
    staffId?: string | null;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
  };
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ClientToBusinessPayment: React.FC<ClientToBusinessPaymentProps> = ({
  businessId,
  businessName,
  amount,
  currency,
  bookingId,
  bookingDetails,
  onSuccess,
  onClose
}) => {
  useEffect(() => {
    // Preload Paystack script when payment component mounts
    const preloadScript = async () => {
      try {
        await loadPaystackScript();
        console.log('ClientToBusinessPayment: Paystack script loaded successfully');
      } catch (error) {
        console.error('ClientToBusinessPayment: Failed to load Paystack script:', error);
      }
    };
    
    preloadScript();
  }, []);

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful:', reference);
    onSuccess?.();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CreditCard className="w-5 h-5" />
            Pay {businessName}
          </CardTitle>
        </CardHeader>
        {bookingDetails && (
          <CardContent>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Service:</strong> {bookingDetails.serviceName}</p>
              {bookingDetails.date && bookingDetails.time && (
                <p><strong>When:</strong> {new Date(bookingDetails.date).toLocaleDateString()} at {bookingDetails.time}</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>


      {/* Direct Payment Component */}
      <DirectPaystackPayment
        amount={amount}
        currency={currency}
        email={bookingDetails?.clientEmail}
        metadata={{
          payment_type: 'client_to_business',
          business_id: businessId,
          booking_id: bookingId,
          business_name: businessName,
          service_id: bookingDetails?.serviceId,
          service_name: bookingDetails?.serviceName,
          staff_id: bookingDetails?.staffId || undefined,
          appointment_date: bookingDetails?.date,
          appointment_time: bookingDetails?.time,
          customer_name: bookingDetails?.clientName,
          customer_phone: bookingDetails?.clientPhone
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        title={`Pay ${businessName}`}
        description="Secure payment powered by Paystack"
        showClientDetails={!bookingDetails?.clientEmail}
        buttonText="Pay"
      />

      {/* Important Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Payment Process</p>
              <p>Your payment is processed securely through Paystack. You can pay using your card, M-Pesa, or other supported payment methods.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
