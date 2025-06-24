
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    email: '',
    phone: ''
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

  const handlePayment = async () => {
    if (!clientDetails.email || !clientDetails.phone) {
      toast.error('Please provide your email and phone number');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Initiating payment with details:', {
        clientEmail: clientDetails.email,
        clientPhone: clientDetails.phone,
        businessId,
        amount,
        bookingId
      });

      // Call our edge function to initialize payment
      const { data, error } = await supabase.functions.invoke('client-to-business-payment', {
        body: {
          clientEmail: clientDetails.email,
          clientPhone: clientDetails.phone,
          businessId,
          amount,
          bookingId,
          paymentMethod: 'paystack'
        }
      });

      console.log('Payment response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Payment initiation failed');
      }

      // Check if response is valid
      if (!data) {
        throw new Error('No response received from payment service');
      }

      // Handle different response formats
      let paymentData = data;
      if (typeof data === 'string') {
        try {
          paymentData = JSON.parse(data);
        } catch (parseError) {
          console.error('Failed to parse response:', data);
          throw new Error('Invalid response from payment service');
        }
      }

      if (paymentData.success === false) {
        throw new Error(paymentData.error || 'Payment initialization failed');
      }

      if (paymentData.success && paymentData.authorization_url) {
        // Redirect to Paystack payment page
        window.open(paymentData.authorization_url, '_blank');
        toast.success('Payment initiated! Complete the payment in the new tab.');
        onSuccess?.();
      } else {
        throw new Error('Invalid payment response - no authorization URL');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const platformFee = amount * 0.05;
  const businessAmount = amount - platformFee;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CreditCard className="w-5 h-5" />
          Pay {businessName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-lg font-bold text-green-800">
              {formatCurrency(amount, currency)}
            </span>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Business receives:</span>
              <span>{formatCurrency(businessAmount, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee (5%):</span>
              <span>{formatCurrency(platformFee, currency)}</span>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="client_email">Your Email</Label>
            <Input
              id="client_email"
              type="email"
              placeholder="your@email.com"
              value={clientDetails.email}
              onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="client_phone">Your Phone Number</Label>
            <Input
              id="client_phone"
              type="tel"
              placeholder="254712345678"
              value={clientDetails.phone}
              onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-green-800">Payment Options</h4>
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
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || !clientDetails.email || !clientDetails.phone}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay {formatCurrency(amount, currency)}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-gray-600 text-center">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Secure payment powered by Paystack
        </div>
      </CardContent>
    </Card>
  );
};
