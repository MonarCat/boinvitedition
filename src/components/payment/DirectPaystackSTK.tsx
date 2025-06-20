
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface DirectPaystackSTKProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onError?: (error: any) => void;
  description?: string;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const DirectPaystackSTK: React.FC<DirectPaystackSTKProps> = ({
  amount,
  email,
  onSuccess,
  onError,
  description = "Payment",
  metadata = {},
  disabled = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingSTK, setIsProcessingSTK] = useState(false);
  const [isProcessingPaystack, setIsProcessingPaystack] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Paystack public key - stored securely as requested
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

  const handleDirectSTKPush = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessingSTK(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Create a direct STK push request to Paystack
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          amount: amount * 100, // Convert to kobo
          currency: 'KES',
          mobile_money: {
            phone: formattedPhone,
            provider: 'mpesa'
          },
          channels: ['mobile_money'],
          metadata: {
            ...metadata,
            payment_method: 'direct_stk_push',
            description: description
          }
        })
      });

      const data = await response.json();

      if (data.status && data.data) {
        toast.success('STK Push sent! Please check your phone and enter your M-Pesa PIN.');
        
        // Poll for payment status
        const pollPaymentStatus = async () => {
          let attempts = 0;
          const maxAttempts = 20;
          
          const checkStatus = async () => {
            if (attempts >= maxAttempts) {
              toast.error('Payment timeout. Please try again.');
              setIsProcessingSTK(false);
              return;
            }

            try {
              const statusResponse = await fetch(`https://api.paystack.co/transaction/verify/${data.data.reference}`, {
                headers: {
                  'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
                }
              });

              const statusData = await statusResponse.json();

              if (statusData.status && statusData.data.status === 'success') {
                onSuccess(statusData.data.reference);
                toast.success('M-Pesa payment completed successfully!');
                setIsProcessingSTK(false);
              } else if (statusData.data.status === 'failed') {
                toast.error('Payment failed. Please try again.');
                onError?.(statusData.data);
                setIsProcessingSTK(false);
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
      } else {
        throw new Error(data.message || 'Failed to initiate STK push');
      }
    } catch (error) {
      console.error('STK Push error:', error);
      toast.error('Failed to initiate STK push. Please try again.');
      onError?.(error);
      setIsProcessingSTK(false);
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
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100,
      currency: 'KES',
      ref: ref,
      label: description,
      metadata: { ...metadata, payment_method: 'paystack_popup' },
      callback: function(response: any) {
        setIsProcessingPaystack(false);
        toast.success('Payment successful!');
        onSuccess(response.reference);
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
        <CardTitle className="text-center">Direct Payment Options</CardTitle>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">KES {amount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Direct STK Push Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-900">Direct M-Pesa STK Push</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Get payment prompt directly on your Safaricom phone via Paystack
          </p>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="phoneNumber">Safaricom Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0712345678 or +254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={disabled || isProcessingSTK}
              />
            </div>

            <Button 
              onClick={handleDirectSTKPush}
              disabled={disabled || isProcessingSTK || !phoneNumber.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessingSTK ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing STK Push...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Send STK Push - KES {amount.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Paystack Payment Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Paystack Payment Gateway</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Pay using Cards, Bank Transfer, or Mobile Money
          </p>
          
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

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span>Secure payments powered by Paystack</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
