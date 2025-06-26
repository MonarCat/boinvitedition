
import React from 'react';

interface PaymentAmountDisplayProps {
  amount: number;
  currency: string;
  paymentType: 'client_to_business' | 'subscription';
}

export const PaymentAmountDisplay: React.FC<PaymentAmountDisplayProps> = ({
  amount,
  currency,
  paymentType
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
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
      <div className="text-3xl font-bold text-green-700 mb-2">
        {formatCurrency(amount, currency)}
      </div>
      {paymentType === 'client_to_business' && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between items-center">
            <span>Business receives:</span>
            <span className="font-medium">{formatCurrency(amount * 0.95, currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Platform fee (5%):</span>
            <span className="font-medium">{formatCurrency(amount * 0.05, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
