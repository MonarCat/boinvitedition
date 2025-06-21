
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PaystackPayment, loadPaystackScript } from './PaystackPayment';

interface EnhancedPaymentFlowProps {
  planType: string;
  amount: number;
  businessId?: string;
  customerEmail?: string;
  currency?: string;
  onSuccess?: (reference: string) => void;
}

export const EnhancedPaymentFlow: React.FC<EnhancedPaymentFlowProps> = ({
  planType,
  amount,
  businessId,
  customerEmail = '',
  currency = 'KES',
  onSuccess
}) => {
  const [email, setEmail] = useState(customerEmail);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Initialize Paystack script on component mount
  React.useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  const handlePaystackSuccess = (reference: string) => {
    setPaymentStatus('success');
    toast.success('Payment successful!');
    onSuccess?.(reference);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'KES') {
      return `KES ${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Options
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{formatAmount(amount, currency)}</Badge>
          <Badge variant="secondary">{planType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Cards & More</h4>
          <p className="text-sm text-blue-700">Cards, Bank Transfer, M-Pesa, USSD & more via Paystack</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="paystack-email">Email Address</Label>
            <Input
              id="paystack-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <PaystackPayment
          amount={amount}
          email={email}
          currency={currency}
          onSuccess={handlePaystackSuccess}
          metadata={{
            plan_type: planType,
            business_id: businessId,
            payment_method: 'paystack_popup'
          }}
          disabled={!email.trim()}
        />

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Visa, Mastercard, Verve cards accepted</p>
          <p>• Bank transfer and USSD available</p>
          <p>• M-Pesa and mobile money supported</p>
          <p>• Secure 256-bit SSL encryption</p>
        </div>

        {paymentStatus === 'success' && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Payment successful!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
