
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Receipt, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (reference || trxref) {
      verifyPayment(reference || trxref);
    } else {
      setIsLoading(false);
      toast.error('Invalid payment reference');
    }
  }, [reference, trxref]);

  const verifyPayment = async (paymentRef: string) => {
    try {
      // Update transaction status to completed
      const { data, error } = await supabase
        .from('client_business_transactions')
        .update({ status: 'completed' })
        .eq('paystack_reference', paymentRef)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        toast.error('Payment verification failed');
      } else {
        setPaymentDetails(data);
        toast.success('Payment completed successfully!');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount Paid:</span>
                <span className="font-semibold">KSh {paymentDetails.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference:</span>
                <span className="font-mono text-sm">{paymentDetails.payment_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold capitalize">{paymentDetails.status}</span>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Receipt className="w-4 h-4" />
              <span className="text-sm">
                A receipt has been sent to your email
              </span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/bookings')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View My Bookings
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Thank you for your payment. Your booking has been confirmed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
