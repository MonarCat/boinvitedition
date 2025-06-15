import React from 'react';

// Remove the dependency on 'qrcode' for now to fix build
// If you need to generate a QR code, use another implementation or add the package via AI/terminal
export const BusinessQRGenerator = ({ businessId }: { businessId: string }) => {
  // Placeholder image/logic for now
  // Optionally, implement server-side or use an external QR solution
  return (
    <div className="flex justify-center">
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          QR Code would appear here for /public-booking/{businessId}
        </p>
        {/* Placeholder fallback */}
      </div>
    </div>
  );
};
