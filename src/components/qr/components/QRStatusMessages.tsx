
import React from 'react';

interface QRStatusMessagesProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
}

export const QRStatusMessages: React.FC<QRStatusMessagesProps> = ({
  validationStatus
}) => {
  if (validationStatus === 'valid') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h5 className="font-medium text-green-900 mb-2 text-sm">QR Code Ready!</h5>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• High error correction (30% damage tolerance)</li>
          <li>• Optimized for mobile camera scanning</li>
          <li>• Works with Apple Camera, Google Lens</li>
          <li>• Points to verified business booking page</li>
        </ul>
      </div>
    );
  }

  if (validationStatus === 'invalid') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <h5 className="font-medium text-red-900 mb-2 text-sm">QR Code Issues</h5>
        <ul className="text-xs text-red-800 space-y-1">
          <li>• Business ID is invalid or business not found</li>
          <li>• Ensure business is active and published</li>
          <li>• Contact support if problem persists</li>
        </ul>
      </div>
    );
  }

  return null;
};
