
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { PaystackPayment, loadPaystackScript } from './PaystackPayment';

interface EnhancedPaymentFlowProps {
  planType: string;
  amount: number;
  businessId?: string;
  customerEmail?: string;
  onSuccess?: (reference: string) => void;
}

export const EnhancedPaymentFlow: React.FC<EnhancedPaymentFlowProps> = ({
  planType,
  amount,
  businessId,
  customerEmail = '',
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

  const isInitializationFee = amount === 10;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Complete Payment
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              KES {amount.toLocaleString()}
            </Badge>
            <Badge variant="secondary">{planType}</Badge>
            {isInitializationFee && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                One-time Setup
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInitializationFee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Initialization Fee</h4>
                  <p className="text-sm text-blue-800">
                    This one-time KES 10 fee sets up your account in our payment system and enables all platform features.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Multiple Payment Options Available</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-green-800">
                <Smartphone className="w-4 h-4" />
                <span>M-Pesa Mobile Money</span>
              </div>
              <div className="flex items-center gap-2 text-green-800">
                <CreditCard className="w-4 h-4" />
                <span>Visa & Mastercard</span>
              </div>
              <div className="flex items-center gap-2 text-green-800">
                <CreditCard className="w-4 h-4" />
                <span>Bank Transfer</span>
              </div>
              <div className="flex items-center gap-2 text-green-800">
                <Smartphone className="w-4 h-4" />
                <span>USSD Banking</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for payment confirmation and receipts
              </p>
            </div>
          </div>

          <PaystackPayment
            amount={amount}
            email={email}
            currency="KES"
            onSuccess={handlePaystackSuccess}
            metadata={{
              plan_type: planType,
              business_id: businessId,
              payment_method: 'paystack_popup',
              is_initialization: isInitializationFee
            }}
            disabled={!email.trim() || paymentStatus === 'processing'}
          />

          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Payment Successful!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your account has been activated and you'll receive a confirmation email shortly.
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Payment Failed</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <p>• Payments are processed securely by Paystack</p>
            <p>• 256-bit SSL encryption protects your data</p>
            <p>• M-Pesa payments are instant and secure</p>
            <p>• You'll receive email confirmation upon successful payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
