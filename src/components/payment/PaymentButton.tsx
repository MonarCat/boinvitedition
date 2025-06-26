
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  onPayment: () => void;
  isProcessing: boolean;
  amount: number;
  currency: string;
  buttonText: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  onPayment,
  isProcessing,
  amount,
  currency,
  buttonText
}) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Button
      onClick={onPayment}
      disabled={isProcessing}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          {buttonText} {formatAmount(amount, currency)}
        </>
      )}
    </Button>
  );
};
