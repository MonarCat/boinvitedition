
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CreditCard, Building2, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(customerEmail);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [selectedMethod, setSelectedMethod] = useState<'stk' | 'paystack'>('stk');

  // Initialize Paystack script on component mount
  React.useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  const handleSTKPush = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate Kenyan phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone.match(/^(254|0)[17]\d{8}$/)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: cleanPhone.startsWith('0') ? `254${cleanPhone.slice(1)}` : cleanPhone,
          amount: amount,
          planType: planType,
          businessId: businessId,
          customerEmail: email
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('STK push sent! Please check your phone and enter your M-Pesa PIN');
        setPaymentStatus('success');
        onSuccess?.(data.checkoutRequestID);
      } else {
        throw new Error(data.message || 'STK push failed');
      }
    } catch (error: any) {
      console.error('STK Push error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackSuccess = (reference: string) => {
    setPaymentStatus('success');
    toast.success('Payment successful!');
    onSuccess?.(reference);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('254')) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    } else if (numbers.startsWith('0')) {
      return numbers.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return numbers;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Payment Options
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">KES {amount.toLocaleString()}</Badge>
          <Badge variant="secondary">{planType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'stk' | 'paystack')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stk" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              M-Pesa
            </TabsTrigger>
            <TabsTrigger value="paystack" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Cards & More
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stk" className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">Direct M-Pesa Payment</h4>
              <p className="text-sm text-green-700">Pay directly through M-Pesa STK push</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  placeholder="0712 345 678 or 254712345678"
                  disabled={isProcessing}
                />
              </div>

              {email && (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSTKPush}
              disabled={isProcessing || !phoneNumber.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending STK Push...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Pay KES {amount.toLocaleString()}
                </>
              )}
            </Button>

            {paymentStatus === 'processing' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Check your phone and enter your M-Pesa PIN</span>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Payment successful!</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paystack" className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Multiple Payment Options</h4>
              <p className="text-sm text-blue-700">Cards, Bank Transfer, M-Pesa, USSD & more</p>
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
              currency="KES"
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
              <p>• M-Pesa also available through Paystack</p>
              <p>• Secure 256-bit SSL encryption</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
