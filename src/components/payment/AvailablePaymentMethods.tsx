
import React from 'react';
import { Smartphone, CreditCard } from 'lucide-react';

export const AvailablePaymentMethods: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-medium text-green-900 mb-3">Multiple Payment Options Available</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-green-800">
          <Smartphone className="w-4 h-4" />
          <span>M-Pesa Mobile Money</span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <CreditCard className="w-4 h-4" />
          <span>Visa & Mastercard</span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <CreditCard className="w-4 h-4" />
          <span>Bank Transfer</span>
        </div>
        <div className="flex items-center gap-2 text-green-800">
          <Smartphone className="w-4 h-4" />
          <span>USSD Banking</span>
        </div>
      </div>
    </div>
  );
};
