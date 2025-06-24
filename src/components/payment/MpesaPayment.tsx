
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MpesaPaymentProps {
  amount: number;
  businessId: string;
  clientEmail: string;
  bookingId?: string;
  onSuccess: (reference: string) => void;
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
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your M-Pesa number');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      console.log('Initiating M-Pesa payment:', {
        amount,
        businessId,
        clientEmail,
        phoneNumber: cleanPhone
      });

      const { data, error } = await supabase.functions.invoke('client-to-business-payment', {
        body: {
          clientEmail,
          clientPhone: cleanPhone,
          businessId,
          amount,
          bookingId,
          paymentMethod: 'mpesa'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Payment initiation failed');
      }

      if (!data?.success) {
        console.error('Payment failed:', data);
        throw new Error(data?.error || 'Payment failed');
      }

      console.log('M-Pesa payment initiated successfully:', data);
      
      toast.success('Payment request sent! Check your phone for the M-Pesa prompt.');
      
      // Start polling for payment status
      if (data.reference) {
        pollPaymentStatus(data.reference);
      }

    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      const errorMessage = error.message || 'M-Pesa payment failed. Please try again.';
      toast.error(errorMessage);
      onError(errorMessage);
    }
  };

  const pollPaymentStatus = async (reference: string) => {
    const maxAttempts = 24; // 2 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;
      
      try {
        // Check transaction status in our database
        const { data: transaction, error } = await supabase
          .from('client_business_transactions')
          .select('status')
          .eq('paystack_reference', reference)
          .single();

        if (error) {
          console.error('Status check error:', error);
          return;
        }

        if (transaction?.status === 'completed') {
          setPaymentStatus('success');
          setIsProcessing(false);
          toast.success('Payment completed successfully!');
          onSuccess(reference);
          return;
        } else if (transaction?.status === 'failed') {
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment failed. Please try again.');
          onError('Payment failed');
          return;
        }

        // Continue polling if pending and within max attempts
        if (attempts < maxAttempts && transaction?.status === 'pending') {
          setTimeout(checkStatus, 5000);
        } else if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment verification timeout. Please contact support if money was deducted.');
          onError('Payment timeout');
        }
      } catch (error) {
        console.error('Status polling error:', error);
        if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          setIsProcessing(false);
          onError('Status check failed');
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700">
            Your M-Pesa payment has been processed successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-2">
            <strong>Amount to Pay:</strong> KSh {amount.toLocaleString()}
          </p>
          <p className="text-xs text-green-600">
            You will receive an M-Pesa payment prompt on your phone
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mpesa-phone">M-Pesa Number</Label>
          <Input
            id="mpesa-phone"
            type="tel"
            placeholder="0712345678 or 254712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        {paymentStatus === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <h4 className="font-medium text-blue-800">Processing Payment</h4>
                <p className="text-sm text-blue-700">
                  Check your phone for the M-Pesa payment prompt. Enter your M-Pesa PIN to complete the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Payment Failed</h4>
                <p className="text-sm text-red-700">
                  The payment could not be processed. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleMpesaPayment}
          disabled={!phoneNumber || isProcessing}
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
              <Smartphone className="w-4 h-4 mr-2" />
              Pay KSh {amount.toLocaleString()} via M-Pesa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
