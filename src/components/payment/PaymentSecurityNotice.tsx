
import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const PaymentSecurityNotice: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-green-800">
          <div className="flex items-center gap-1 font-medium mb-1">
            <Lock className="w-3 h-3" />
            Secure Payment
          </div>
          <p className="leading-relaxed">
            Your payment is processed securely through Paystack with industry-standard encryption. 
            We never store your payment information.
          </p>
        </div>
      </div>
    </div>
  );
};
