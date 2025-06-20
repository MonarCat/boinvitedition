
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DirectPaystackPaymentProps {
  amount: number;
  email: string;
  currency?: string;
  description?: string;
  onSuccess: (reference: string) => void;
  onError?: (error: any) => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const DirectPaystackPayment: React.FC<DirectPaystackPaymentProps> = ({
  amount,
  email,
  currency = 'KES',
  description = 'Payment',
  onSuccess,
  onError,
  metadata = {},
  disabled = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Paystack public key (stored securely in component)
  const PAYSTACK_PUBLIC_KEY = 'pk_live_bf23005a6155ba4e9865b77bd07eebf4c2f52512';

  // Load Paystack script
  useEffect(() => {
    const loadPaystackScript = () => {
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => setPaystackLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        toast.error('Failed to load payment system');
      };
      document.head.appendChild(script);
    };

    loadPaystackScript();
  }, []);

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const kenyanPhoneRegex = /^(\+254|254|0)?([17]\d{8})$/;
    return kenyanPhoneRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.startsWith('+254')) return cleanPhone;
    if (cleanPhone.startsWith('254')) return `+${cleanPhone}`;
    if (cleanPhone.startsWith('0')) return `+254${cleanPhone.substring(1)}`;
    return `+254${cleanPhone}`;
  };

  const handleMpesaPayment = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessingMpesa(true);

    const ref = `MPESA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency: currency,
        ref: ref,
        label: description,
        channels: ['mobile_money'], // Force M-Pesa channel
        mobile_money: {
          phone: formattedPhone,
          provider: 'mpesa'
        },
        metadata: {
          ...metadata,
          payment_method: 'mpesa_stk',
          phone_number: formattedPhone
        },
        callback: function(response: any) {
          setIsProcessingMpesa(false);
          toast.success('M-Pesa payment successful!');
          onSuccess(response.reference);
        },
        onClose: function() {
          setIsProcessingMpesa(false);
          toast.info('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setIsProcessingMpesa(false);
      toast.error('Failed to initiate M-Pesa payment. Please try again.');
      onError?.(error);
    }
  };

  const handleCardPayment = () => {
    if (!paystackLoaded || !window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessingCard(true);

    const ref = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency: currency,
        ref: ref,
        label: description,
        channels: ['card', 'bank', 'ussd', 'qr'], // All channels except mobile_money
        metadata: {
          ...metadata,
          payment_method: 'paystack_gateway'
        },
        callback: function(response: any) {
          setIsProcessingCard(false);
          toast.success('Payment successful!');
          onSuccess(response.reference);
        },
        onClose: function() {
          setIsProcessingCard(false);
          toast.info('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Card payment error:', error);
      setIsProcessingCard(false);
      toast.error('Failed to initiate payment. Please try again.');
      onError?.(error);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Complete Payment</CardTitle>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {currency} {amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mpesa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mpesa" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              M-Pesa STK
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Card/Bank
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mpesa" className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">M-Pesa STK Push</h3>
              </div>
              <p className="text-sm text-green-700">
                Get a payment prompt directly on your Safaricom phone
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="phoneNumber">Safaricom Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0712345678 or +254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={disabled || isProcessingMpesa}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive an M-Pesa prompt to authorize payment
                </p>
              </div>

              <Button 
                onClick={handleMpesaPayment}
                disabled={disabled || isProcessingMpesa || !phoneNumber.trim() || !paystackLoaded}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessingMpesa ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing M-Pesa...
                  </>
                ) : !paystackLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Payment System...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Pay {currency} {amount.toLocaleString()} via M-Pesa
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Card & Bank Payment</h3>
              </div>
              <p className="text-sm text-blue-700">
                Pay using Visa, Mastercard, Bank Transfer, or other payment methods
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p><strong>Supported Methods:</strong></p>
                <ul className="text-gray-600 ml-4">
                  <li>• Visa, Mastercard, Verve Cards</li>
                  <li>• Bank Transfers</li>
                  <li>• USSD Banking</li>
                  <li>• QR Code Payments</li>
                </ul>
              </div>

              <Button 
                onClick={handleCardPayment}
                disabled={disabled || isProcessingCard || !paystackLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessingCard ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening Payment Gateway...
                  </>
                ) : !paystackLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Payment System...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {currency} {amount.toLocaleString()} with Card/Bank
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span>Secure payments powered by Paystack</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
