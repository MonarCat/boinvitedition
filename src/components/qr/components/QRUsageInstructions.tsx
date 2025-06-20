
import React from 'react';

interface QRUsageInstructionsProps {
  businessSlug: string;
}

export const QRUsageInstructions: React.FC<QRUsageInstructionsProps> = ({
  businessSlug
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <h5 className="font-medium text-gray-900 mb-2 text-sm">How Clients Can Book</h5>
      <ul className="text-xs text-gray-700 space-y-1">
        <li>• Scan QR code with phone camera</li>
        <li>• Click shared WhatsApp/SMS links</li>
        <li>• Visit: boinvit.com/{businessSlug}</li>
        <li>• No app download required</li>
        <li>• Works on all devices</li>
      </ul>
    </div>
  );
};
