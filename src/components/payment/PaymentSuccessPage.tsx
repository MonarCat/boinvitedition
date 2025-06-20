
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const reference = searchParams.get('reference');
  const method = searchParams.get('method');
  const amount = searchParams.get('amount');
  const type = searchParams.get('type'); // 'booking' or 'subscription'

  useEffect(() => {
    if (reference) {
      setPaymentDetails({
        reference,
        method,
        amount: amount ? parseFloat(amount) : 0,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }, [reference, method, amount, type]);

  const handleDownloadReceipt = () => {
    if (!paymentDetails) return;

    const receiptData = {
      reference: paymentDetails.reference,
      amount: paymentDetails.amount,
      method: paymentDetails.method,
      type: paymentDetails.type,
      timestamp: paymentDetails.timestamp,
      business: 'Boinvit Platform'
    };

    const receiptText = `
BOINVIT PAYMENT RECEIPT
========================
Reference: ${receiptData.reference}
Amount: KES ${receiptData.amount.toLocaleString()}
Payment Method: ${receiptData.method === 'direct_mpesa' ? 'Direct M-Pesa' : 'Paystack'}
Type: ${receiptData.type === 'subscription' ? 'Subscription Payment' : 'Booking Payment'}
Date: ${new Date(receiptData.timestamp).toLocaleString()}

Thank you for using Boinvit!
For support, contact: support@boinvit.com
========================
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boinvit-receipt-${receiptData.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Receipt downloaded successfully!');
  };

  const handleGoHome = () => {
    navigate('/app');
  };

  const handleViewBookings = () => {
    navigate('/app/bookings');
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <p className="text-gray-600">Your payment has been processed successfully</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">KES {paymentDetails.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm">{paymentDetails.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span>{paymentDetails.method === 'direct_mpesa' ? 'Direct M-Pesa' : 'Paystack'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="capitalize">
                {paymentDetails.type === 'subscription' ? 'Subscription' : 'Booking'} Payment
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(paymentDetails.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleDownloadReceipt}
              variant="outline" 
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>

            {paymentDetails.type === 'booking' && (
              <Button 
                onClick={handleViewBookings}
                variant="outline" 
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
            )}

            <Button 
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Thank you for using Boinvit!</p>
            <p>For support, contact: support@boinvit.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
