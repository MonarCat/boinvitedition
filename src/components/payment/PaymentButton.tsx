
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils';

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

  return (
    <Button 
      onClick={onPayment}
      disabled={isProcessing}
      variant="redGlossy"
      className="w-full h-12 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-800"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
          <span className="text-white font-bold">Processing Payment...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 mr-2 text-white" />
          <span className="text-white font-bold">{buttonText} {formatCurrency(amount, currency)}</span>
        </>
      )}
    </Button>
  );
};
