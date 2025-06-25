
import React from 'react';

interface QRHeaderProps {
  businessName: string;
}

export const QRHeader: React.FC<QRHeaderProps> = ({ businessName }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {businessName}
      </h1>
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Book Our Services
      </h2>
      <p className="text-lg text-gray-700">
        Scan the QR code below to book your appointment instantly
      </p>
    </div>
  );
};
