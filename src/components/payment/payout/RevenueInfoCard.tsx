
import React from 'react';

interface RevenueInfoCardProps {
  businessName?: string;
}

export const RevenueInfoCard: React.FC<RevenueInfoCardProps> = ({ businessName }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h5 className="font-medium text-blue-900 mb-2">Revenue Sharing</h5>
      <div className="text-sm text-blue-800 space-y-1">
        <p>• Platform fee: 5% per transaction</p>
        <p>• You receive: 95% of each payment</p>
        <p>• Payouts processed within 24 hours</p>
        <p>• Real-time transaction tracking</p>
      </div>
    </div>
  );
};
