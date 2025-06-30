import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PaymentStatusProps {
  bookingId: string;
  status: 'pending' | 'paid' | 'failed';
  amount: number;
  currency?: string;
  serviceName?: string;
  onProcessPayment?: () => void;
}

export const PaymentStatus = ({
  bookingId,
  status,
  amount,
  currency = 'KES',
  serviceName = 'Booking',
  onProcessPayment
}: PaymentStatusProps) => {
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return `${currency === 'KES' ? 'KSh' : currency} ${amount.toLocaleString()}`;
  };
  
  if (status === 'paid') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Payment Complete</h4>
              <p className="text-sm text-green-700 mb-2">
                Your payment of {formatCurrency(amount)} for {serviceName} has been processed successfully.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => navigate(`/app/bookings/${bookingId}`)}
              >
                View Booking Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Payment Failed</h4>
              <p className="text-sm text-red-700 mb-2">
                The payment of {formatCurrency(amount)} for {serviceName} was unsuccessful. Please try again.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 text-red-700 hover:bg-red-100 mr-2"
                onClick={onProcessPayment}
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600"
                onClick={() => navigate('/app/bookings')}
              >
                View All Bookings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default is pending
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800">Payment Required</h4>
            <p className="text-sm text-orange-700 mb-2">
              Please complete payment of {formatCurrency(amount)} for {serviceName} to confirm your booking.
            </p>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={onProcessPayment}
            >
              Complete Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
