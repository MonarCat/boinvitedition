
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
      {/* Business Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CreditCard className="w-5 h-5" />
            Pay {businessName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Payment Methods Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-200">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Cards (Visa, Mastercard)</span>
              <Badge className="ml-auto bg-green-500">Available</Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-200">
              <Smartphone className="w-4 h-4 text-green-600" />
              <span className="text-sm">Mobile Money (M-Pesa, Airtel)</span>
              <Badge className="ml-auto bg-green-500">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
