
import React from 'react';
import { CreditCard, Smartphone } from 'lucide-react';

export const PaymentMethodsInfo: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Available Payment Options</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700">Card</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <Smartphone className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700">M-Pesa</span>
        </div>
      </div>
    </div>
  );
};
