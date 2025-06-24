
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle, Smartphone } from 'lucide-react';
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
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            {title}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {formatCurrency(amount, currency)}
            </div>
            {metadata.payment_type === 'client_to_business' && (
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Business receives:</span>
                  <span className="font-medium">{formatCurrency(amount * 0.95, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform fee (5%):</span>
                  <span className="font-medium">{formatCurrency(amount * 0.05, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Client Details Form */}
          {showClientDetails && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="your@email.com"
                  value={clientDetails.email}
                  onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="client_phone"
                  type="tel"
                  placeholder="254712345678"
                  value={clientDetails.phone}
                  onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_name" className="text-sm font-medium text-gray-700">
                  Full Name (Optional)
                </Label>
                <Input
                  id="client_name"
                  type="text"
                  placeholder="Your full name"
                  value={clientDetails.name}
                  onChange={(e) => setClientDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Payment Methods Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Available Payment Options</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Card</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">M-Pesa</span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                {buttonText} {formatCurrency(amount, currency)}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
