import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { forcePaymentDashboardUpdate } from '@/utils/dashboardUpdateHelpers';

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
  const queryClient = useQueryClient();

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
    toast.info("Sending payment request to your phone...");

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

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Payment initiation failed');
      }

      // Check if response is valid
      if (!data) {
        throw new Error('No response received from payment service');
      }

      // Handle different response formats
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.success) {
            throw new Error(parsed.error || 'Payment failed');
          }
        } catch (parseError) {
          console.error('Failed to parse response:', data);
          throw new Error('Invalid response from payment service');
        }
      } else if (data.success === false) {
        throw new Error(data.error || 'Payment failed');
      }

      console.log('M-Pesa payment initiated successfully:', data);
      
      toast.success('Payment request sent! Check your phone for the M-Pesa prompt.');
      
      // Start polling for payment status if we have a reference
      const reference = data.reference || data.payment_reference;
      if (reference) {
        // Store reference in localStorage for potential manual refresh
        try {
          localStorage.setItem('lastPaymentReference', reference);
          console.log('Payment reference stored for manual refresh:', reference);
        } catch (err) {
          console.error('Could not store payment reference:', err);
        }
        
        // Start polling with an optimized backoff strategy
        pollWithBackoff(reference);
      } else {
        // If no reference, this is an unexpected success, but we handle it gracefully
        console.warn('M-Pesa initiated successfully but no reference was returned.');
        setPaymentStatus('success');
        setIsProcessing(false);
        onSuccess('mpesa-success-noref');
        toast.success('Payment processed! Thank you.');
      }

    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      
      let errorMessage = 'M-Pesa payment failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      onError(errorMessage);
    }
  };

  const pollWithBackoff = (reference: string) => {
    let attempt = 0;
    let delay = 2000; // Start with a 2-second delay
    const maxDelay = 15000; // Maximum delay of 15 seconds
    const maxAttempts = 20; // Poll for roughly 3 minutes

    const checkStatus = async () => {
      if (attempt >= maxAttempts) {
        console.log('Payment verification timed out after maximum attempts');
        setPaymentStatus('failed');
        setIsProcessing(false);
        toast.error('Payment verification timeout', {
          description: 'If you paid, please contact support. You can also refresh to check again.',
          duration: 10000
        });
        onError('Payment timeout');
        return;
      }

      attempt++;
      console.log(`Checking payment status (attempt ${attempt}/${maxAttempts}) for reference: ${reference}`);

      try {
        const { data: transaction, error } = await supabase
          .from('payment_transactions')
          .select('status, amount')
          .eq('paystack_reference', reference) // Assuming M-Pesa reference is stored here
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "exact one row" error
          throw error;
        }

        if (transaction?.status === 'completed' || transaction?.status === 'success') {
          console.log('Payment confirmed as successful!');
          setPaymentStatus('success');
          setIsProcessing(false);
          toast.success('Payment completed successfully!');
          
          forcePaymentDashboardUpdate(businessId, queryClient, {
            reference,
            bookingId,
            amount: transaction?.amount || amount
          });
          
          onSuccess(reference);
          return; // Stop polling
        } else if (transaction?.status === 'failed') {
          console.log('Payment confirmed as failed');
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment failed. Please try again.');
          onError('Payment failed');
          return; // Stop polling
        }

        // If still pending, schedule the next poll
        setTimeout(checkStatus, delay);
        // Increase delay for next time, up to the max
        delay = Math.min(delay + 2000, maxDelay);

      } catch (err) {
        console.error('Error during payment status polling:', err);
        // On error, retry with the same delay
        setTimeout(checkStatus, delay);
      }
    };

    // Start the first check
    setTimeout(checkStatus, delay);
  };

  // This function is kept for manual refresh but the primary polling is now pollWithBackoff
  const pollPaymentStatus = async (reference: string) => {
    const maxAttempts = 36; // 3 minutes with 5-second intervals
    let attempts = 0;

    // Check multiple tables for payment status - more robust approach
    const checkStatus = async () => {
      attempts++;
      console.log(`Checking payment status (${attempts}/${maxAttempts}) for reference: ${reference}`);
      
      try {
        // Check transaction status in our database in multiple tables
        const [clientBusinessResult, paymentTxResult, paymentsResult] = await Promise.all([
          // Check client_business_transactions table
          supabase
            .from('client_business_transactions')
            .select('status')
            .eq('paystack_reference', reference)
            .maybeSingle(),
          
          // Check payment_transactions table
          supabase
            .from('payment_transactions')
            .select('status')
            .eq('paystack_reference', reference)
            .maybeSingle(),
          
          // Check payments table
          supabase
            .from('payments')
            .select('status')
            .eq('reference', reference)
            .maybeSingle()
        ]);

        // Get transaction from any of the tables
        const transaction = clientBusinessResult.data || paymentTxResult.data || paymentsResult.data;
        
        // Log results for debugging
        console.log('Payment status check results:', {
          clientBusinessTx: clientBusinessResult.data?.status,
          paymentTx: paymentTxResult.data?.status,
          payment: paymentsResult.data?.status
        });

        if (transaction?.status === 'completed' || 
            transaction?.status === 'success' || 
            transaction?.status === 'paid') {
          console.log('Payment confirmed as successful!');
          setPaymentStatus('success');
          setIsProcessing(false);
          toast.success('Payment completed successfully!');
          
          // Force dashboard update to ensure business sees the payment immediately
          forcePaymentDashboardUpdate(businessId, queryClient, {
            reference,
            bookingId,
            amount: transaction?.amount || amount
          });
          
          onSuccess(reference);
          return;
        } else if (transaction?.status === 'failed') {
          console.log('Payment confirmed as failed');
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment failed. Please try again.');
          onError('Payment failed');
          return;
        }

        // Continue polling if pending and within max attempts
        if (attempts < maxAttempts) {
          // Update UI to show we're still checking
          if (attempts % 4 === 0) { // Every 20 seconds (4 * 5s)
            toast.info('Still checking payment status...', { duration: 3000 });
          }
          setTimeout(checkStatus, 5000);
        } else if (attempts >= maxAttempts) {
          console.log('Payment verification timed out after maximum attempts');
          setPaymentStatus('failed');
          setIsProcessing(false);
          
          // Show a more helpful error message with instructions for manual refresh
          toast.error('Payment verification timeout', {
            description: 'Please refresh the page in a few minutes to check your payment status. If money was deducted, please contact support.',
            duration: 10000
          });
          onError('Payment timeout');
        }
      } catch (error) {
        console.error('Status polling error:', error);
        
        // Don't give up on first error - keep trying unless we've hit the limit
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setPaymentStatus('failed');
          setIsProcessing(false);
          onError('Status check failed');
        }
      }
    };

    // Start polling sooner (after 3 seconds)
    toast.info('Checking payment status...', { duration: 3000 });
    setTimeout(checkStatus, 3000);
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
            {/* Add manual refresh button for when automatic updates fail */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full border-blue-300 text-blue-700"
              onClick={() => {
                toast.info("Manually checking payment status...");
                if (isProcessing) {
                  // If reference exists in component state, use it for polling
                  const reference = localStorage.getItem('lastPaymentReference');
                  if (reference) {
                    pollPaymentStatus(reference);
                  } else {
                    toast.error("No payment reference found for manual refresh");
                  }
                }
              }}
              disabled={!isProcessing}
            >
              <Info className="w-4 h-4 mr-2" />
              Refresh Payment Status
            </Button>
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
