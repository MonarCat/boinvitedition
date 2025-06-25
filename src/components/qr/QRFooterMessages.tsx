
import React from 'react';

interface QRFooterMessagesProps {
  businessName: string;
}

export const QRFooterMessages: React.FC<QRFooterMessagesProps> = ({ businessName }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Why Book Online?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose your preferred time slot</li>
          <li>• See real-time availability</li>
          <li>• Get instant confirmation</li>
          <li>• Receive appointment reminders</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Safe & Secure</h4>
        <p className="text-sm text-green-800">
          Your booking information is protected with enterprise-grade security. 
          We never share your personal details with third parties.
        </p>
      </div>

      <div className="text-center text-gray-600">
        <p className="text-sm mb-2">
          Having trouble? Contact {businessName} directly or visit our website.
        </p>
        <p className="text-xs">
          This QR code was generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
