
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DirectPaystackPaymentProps {
  amount: number;
  currency: string;
  email?: string;
  metadata: {
    payment_type: 'client_to_business' | 'subscription';
    business_id?: string;
    booking_id?: string;
    plan_type?: string;
    business_name?: string;
    customer_name?: string;
  };
  onSuccess: (reference: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  title?: string;
  description?: string;
  showClientDetails?: boolean;
}

// Paystack public key - safe to store in frontend
const PAYSTACK_PUBLIC_KEY = 'pk_live_bf23005a6155ba4e9865b77bd07eebf4c2f52512';

export const DirectPaystackPayment: React.FC<DirectPaystackPaymentProps> = ({
  amount,
  currency,
  email: initialEmail = '',
  metadata,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  title = 'Complete Payment',
  description = 'Secure payment powered by Paystack',
  showClientDetails = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    email: initialEmail,
    phone: '',
    name: ''
  });

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh ',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const validateInputs = () => {
    if (showClientDetails) {
      if (!clientDetails.email) {
        toast.error('Please provide your email address');
        return false;
      }
      if (!clientDetails.phone) {
        toast.error('Please provide your phone number');
        return false;
      }
    }
    return true;
  };

  const generateReference = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const prefix = metadata.payment_type === 'subscription' ? 'SUB' : 'CBP';
    return `${prefix}_${timestamp}_${randomId}`;
  };

  const logTransaction = async (reference: string, status: string) => {
    try {
      if (metadata.payment_type === 'client_to_business' && metadata.business_id) {
        // Calculate platform fee (5%)
        const platformFee = amount * 0.05;
        const businessAmount = amount - platformFee;

        await supabase
          .from('client_business_transactions')
          .insert({
            client_email: clientDetails.email,
            client_phone: clientDetails.phone,
            business_id: metadata.business_id,
            booking_id: metadata.booking_id,
            amount: amount,
            platform_fee: platformFee,
            business_amount: businessAmount,
            payment_reference: reference,
            paystack_reference: reference,
            payment_method: 'paystack',
            status: status
          });
      }
      
      // Log general payment transaction
      await supabase
        .from('payment_transactions')
        .insert({
          business_id: metadata.business_id,
          amount: amount,
          currency: currency.toUpperCase(),
          status: status,
          payment_method: 'paystack',
          paystack_reference: reference,
          transaction_type: metadata.payment_type,
          metadata: metadata
        });
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  };

  const handlePayment = async () => {
    if (!validateInputs()) return;
    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    const reference = generateReference();
    const paymentEmail = showClientDetails ? clientDetails.email : initialEmail;

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: paymentEmail,
        amount: amount * 100, // Convert to kobo
        currency: currency,
        ref: reference,
        metadata: {
          ...metadata,
          client_email: paymentEmail,
          client_phone: clientDetails.phone,
          client_name: clientDetails.name
        },
        callback: function(response: any) {
          setIsProcessing(false);
          
          // Log successful transaction
          logTransaction(response.reference, 'completed').then(() => {
            toast.success('Payment successful!');
            onSuccess(response.reference);
          }).catch((error) => {
            console.error('Transaction logging failed:', error);
            // Still call onSuccess since payment was successful
            toast.success('Payment successful!');
            onSuccess(response.reference);
          });
        },
        onClose: function() {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (error: any) {
      setIsProcessing(false);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
      onError?.(errorMessage);
      
      // Log failed transaction
      await logTransaction(reference, 'failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">
            {formatCurrency(amount, currency)}
          </div>
          {metadata.payment_type === 'client_to_business' && (
            <div className="text-xs text-gray-500 mt-2">
              <div className="flex justify-between">
                <span>Business receives:</span>
                <span>{formatCurrency(amount * 0.95, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (5%):</span>
                <span>{formatCurrency(amount * 0.05, currency)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Client Details Form */}
        {showClientDetails && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="client_email">Email Address</Label>
              <Input
                id="client_email"
                type="email"
                placeholder="your@email.com"
                value={clientDetails.email}
                onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Phone Number</Label>
              <Input
                id="client_phone"
                type="tel"
                placeholder="254712345678"
                value={clientDetails.phone}
                onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client_name">Full Name (Optional)</Label>
              <Input
                id="client_name"
                type="text"
                placeholder="Your full name"
                value={clientDetails.name}
                onChange={(e) => setClientDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Payment Methods Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Payment Options</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CreditCard className="w-3 h-3 text-green-600" />
              <span>Cards</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CreditCard className="w-3 h-3 text-green-600" />
              <span>M-Pesa</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {buttonText} {formatCurrency(amount, currency)}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <CheckCircle className="w-3 h-3" />
            <span>{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Load Paystack script
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

// Type declaration for Paystack
declare global {
  interface Window {
    PaystackPop: any;
  }
}
