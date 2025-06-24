
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const PaymentSecurityNotice: React.FC = () => {
  return (
    <div className="text-center pt-2">
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <CheckCircle className="w-3 h-3 text-green-600" />
        <span>Secured by 256-bit SSL encryption</span>
      </div>
    </div>
  );
};
