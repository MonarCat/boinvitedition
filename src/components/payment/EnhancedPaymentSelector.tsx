
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedPaymentSelectorProps {
  amount: number;
  email: string;
  onSuccess: (reference: string, method: string) => void;
  onError?: (error: any) => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
  description?: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const EnhancedPaymentSelector: React.FC<EnhancedPaymentSelectorProps> = ({
  amount,
  email,
  onSuccess,
  onError,
  metadata = {},
  disabled = false,
  description = "Payment"
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [isProcessingPaystack, setIsProcessingPaystack] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

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

  const handleDirectMpesa = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessingMpesa(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: formattedPhone,
          amount: amount,
          description: description,
          metadata: { ...metadata, paymentMethod: 'direct_mpesa' }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Payment request sent! Please check your phone and enter your M-Pesa PIN.');
        
        // Poll for payment status
        const pollPaymentStatus = async () => {
          let attempts = 0;
          const maxAttempts = 20; // 1 minute total (3s intervals)
          
          const checkStatus = async () => {
            if (attempts >= maxAttempts) {
              toast.error('Payment timeout. Please try again.');
              setIsProcessingMpesa(false);
              return;
            }

            try {
              const { data: statusData } = await supabase.functions.invoke('check-mpesa-status', {
                body: { checkoutRequestId: data.checkoutRequestId }
              });

              if (statusData?.status === 'completed') {
                onSuccess(statusData.reference, 'direct_mpesa');
                toast.success('M-Pesa payment completed successfully!');
                setIsProcessingMpesa(false);
              } else if (statusData?.status === 'failed') {
                toast.error('Payment failed. Please try again.');
                onError?.(statusData.error);
                setIsProcessingMpesa(false);
              } else {
                attempts++;
                setTimeout(checkStatus, 3000);
              }
            } catch (error) {
              console.error('Status check error:', error);
              attempts++;
              setTimeout(checkStatus, 3000);
            }
          };

          setTimeout(checkStatus, 5000);
        };

        pollPaymentStatus();
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error('Failed to initiate M-Pesa payment. Please try again.');
      onError?.(error);
      setIsProcessingMpesa(false);
    }
  };

  const handlePaystackPayment = () => {
    if (!paystackLoaded || !window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessingPaystack(true);

    const ref = `BOINVIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handler = window.PaystackPop.setup({
      key: 'pk_live_bf23005a6155ba4e9865b77bd07eebf4c2f52512',
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: 'KES',
      ref: ref,
      label: description,
      metadata: { ...metadata, paymentMethod: 'paystack', boinvit_ref: ref },
      callback: function(response: any) {
        setIsProcessingPaystack(false);
        toast.success('Payment successful!');
        onSuccess(response.reference, 'paystack');
      },
      onClose: function() {
        setIsProcessingPaystack(false);
        toast.info('Payment cancelled');
      }
    });

    handler.openIframe();
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Choose Payment Method</CardTitle>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">KES {amount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="direct-mpesa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct-mpesa" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Direct M-Pesa
            </TabsTrigger>
            <TabsTrigger value="paystack" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Paystack
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct-mpesa" className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Direct M-Pesa STK Push</h3>
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
                onClick={handleDirectMpesa}
                disabled={disabled || isProcessingMpesa || !phoneNumber.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessingMpesa ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing M-Pesa...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Pay KES {amount.toLocaleString()} via M-Pesa
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paystack" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Paystack Payment Gateway</h3>
              </div>
              <p className="text-sm text-blue-700">
                Pay using Cards, Bank Transfer, M-Pesa, or other mobile money options
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p><strong>Supported Methods:</strong></p>
                <ul className="text-gray-600 ml-4">
                  <li>• Visa, Mastercard, Verve Cards</li>
                  <li>• Bank Transfers (Kenya)</li>
                  <li>• M-Pesa via Paystack</li>
                  <li>• Other Mobile Money</li>
                </ul>
              </div>

              <Button 
                onClick={handlePaystackPayment}
                disabled={disabled || isProcessingPaystack || !paystackLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessingPaystack ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening Paystack...
                  </>
                ) : !paystackLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Payment System...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay KES {amount.toLocaleString()} via Paystack
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span>Secure payments powered by Boinvit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
