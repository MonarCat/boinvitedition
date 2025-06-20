
import React from 'react';
import { BoinvitQRGenerator } from './BoinvitQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Customer Booking QR Code</h3>
        <p className="text-sm text-blue-700 mb-4">
          When customers scan this QR code, they'll be taken directly to your booking page where they can:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• View all your available services</li>
          <li>• Select their preferred service</li>
          <li>• Choose appointment date and time</li>
          <li>• Complete their booking</li>
        </ul>
      </div>
      
      <BoinvitQRGenerator 
        businessId={businessId} 
        businessName={businessName} 
      />
    </div>
  );
};
