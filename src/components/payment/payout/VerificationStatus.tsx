
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const VerificationStatus: React.FC = () => {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
        <div>
          <h5 className="font-medium text-orange-900 mb-1">Verification Required</h5>
          <p className="text-sm text-orange-800">
            After saving your payout details, you'll need to verify your mobile money or bank account 
            to start receiving payments. This helps ensure secure transactions.
          </p>
        </div>
      </div>
    </div>
  );
};
