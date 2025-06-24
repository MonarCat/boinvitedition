
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
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh ',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  return (
    <Button 
      onClick={onPayment}
      disabled={isProcessing}
      className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 mr-2" />
          {buttonText} {formatCurrency(amount, currency)}
        </>
      )}
    </Button>
  );
};
