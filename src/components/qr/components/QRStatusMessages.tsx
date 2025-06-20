
import React from 'react';

interface QRStatusMessagesProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
  businessSlug: string;
  hasServices: boolean;
}

export const QRStatusMessages: React.FC<QRStatusMessagesProps> = ({
  validationStatus,
  businessSlug,
  hasServices
}) => {
  if (validationStatus === 'valid') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h5 className="font-medium text-green-900 mb-2 text-sm">✅ QR Code Ready!</h5>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Business verified and active</li>
          <li>• Clean URL: boinvit.com/{businessSlug}</li>
          <li>• QR code points to clean URL</li>
          <li>• High error correction enabled</li>
          <li>• Mobile-optimized scanning</li>
          <li>• Multiple sharing options available</li>
          {hasServices && <li>• Services available for booking</li>}
          {!hasServices && <li>• ⚠️ No active services found</li>}
        </ul>
      </div>
    );
  }

  if (validationStatus === 'invalid') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <h5 className="font-medium text-red-900 mb-2 text-sm">❌ Setup Required</h5>
        <ul className="text-xs text-red-800 space-y-1">
          <li>• Business ID invalid or not found</li>
          <li>• Ensure business is active and published</li>
          <li>• Check if business has active services</li>
          <li>• Verify business registration is complete</li>
        </ul>
      </div>
    );
  }

  return null;
};
