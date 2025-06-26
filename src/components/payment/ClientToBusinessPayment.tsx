
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { DirectPaystackPayment, loadPaystackScript } from './DirectPaystackPayment';

interface ClientToBusinessPaymentProps {
  businessId: string;
  businessName: string;
  amount: number;
  currency: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export const ClientToBusinessPayment: React.FC<ClientToBusinessPaymentProps> = ({
  businessId,
  businessName,
  amount,
  currency,
  bookingId,
  onSuccess
}) => {
  useEffect(() => {
    loadPaystackScript().catch(console.error);
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
      {/* Direct Payment Component */}
      <DirectPaystackPayment
        amount={amount}
        currency={currency}
        metadata={{
          payment_type: 'client_to_business',
          business_id: businessId,
          booking_id: bookingId,
          business_name: businessName
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        title={`Pay ${businessName}`}
        description="Secure payment powered by Paystack"
        showClientDetails={true}
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
