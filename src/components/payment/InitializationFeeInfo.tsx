
import React from 'react';
import { Info } from 'lucide-react';

export const InitializationFeeInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900 mb-1">Initialization Fee</h4>
          <p className="text-sm text-blue-800">
            This one-time KES 10 fee sets up your account in our payment system and enables all platform features.
          </p>
        </div>
      </div>
    </div>
  );
};
