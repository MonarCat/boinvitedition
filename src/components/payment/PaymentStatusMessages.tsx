
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentStatusMessagesProps {
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
}

export const PaymentStatusMessages: React.FC<PaymentStatusMessagesProps> = ({
  paymentStatus
}) => {
  if (paymentStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Payment Successful!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your account has been activated and you'll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Payment Failed</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Please try again or contact support if the problem persists.
        </p>
      </div>
    );
  }

  return null;
};
