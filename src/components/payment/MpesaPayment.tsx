
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PaymentErrorHandler } from './PaymentErrorHandler';

interface MpesaPaymentProps {
  amount: number;
  businessId: string;
  clientEmail: string;
  bookingId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  businessId,
  clientEmail,
  bookingId,
  onSuccess,
  onError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const handlePayment = async () => {
    setError(null);
    
    if (!phoneNumber.trim()) {
      const errorMsg = 'Please enter your M-Pesa phone number';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (formattedPhone.length !== 12) {
      const errorMsg = 'Please enter a valid phone number (e.g., 0712345678)';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('client-to-business-payment', {
        body: {
          clientEmail,
          clientPhone: formattedPhone,
          businessId,
          amount,
          bookingId,
          paymentMethod: 'mpesa'
        }
      });

      if (funcError) {
        console.error('Payment error:', funcError);
        const errorMsg = 'Payment failed. Please try again.';
        setError(errorMsg);
        onError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      if (data?.success) {
        toast.success('Payment request sent! Check your phone for the M-Pesa prompt.');
        onSuccess();
      } else {
        const errorMsg = data?.error || 'Payment failed';
        setError(errorMsg);
        onError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = 'Payment failed. Please try again.';
      setError(errorMsg);
      onError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handlePayment();
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentErrorHandler 
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount to Pay:</span>
            <span className="text-lg font-bold text-green-800">
              KSh {amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mpesa_phone">M-Pesa Phone Number</Label>
          <Input
            id="mpesa_phone"
            type="tel"
            placeholder="0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-600">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing || !phoneNumber.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Pay KSh {amount.toLocaleString()} via M-Pesa
            </>
          )}
        </Button>

        <div className="text-xs text-gray-600 text-center">
          You'll receive an M-Pesa prompt on your phone to complete the payment
        </div>
      </CardContent>
    </Card>
  );
};
