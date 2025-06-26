
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

interface PaymentAmountDisplayProps {
  amount: number;
  currency: string;
  paymentType: string;
}

export const PaymentAmountDisplay: React.FC<PaymentAmountDisplayProps> = ({
  amount,
  currency,
  paymentType
}) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'client_to_business':
        return 'Service Payment';
      case 'subscription':
        return 'Subscription Fee';
      default:
        return 'Payment';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">
            {getPaymentTypeLabel(paymentType)}
          </span>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">
          {formatAmount(amount, currency)}
        </div>
        <p className="text-xs text-blue-600">
          Secure payment processing
        </p>
      </CardContent>
    </Card>
  );
};
