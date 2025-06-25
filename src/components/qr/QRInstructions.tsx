
import React from 'react';

export const QRInstructions: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        How to Use This QR Code
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl mb-2">📱</div>
          <h4 className="font-semibold text-blue-900 mb-2">Step 1</h4>
          <p className="text-blue-800">Open your phone's camera app</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-3xl mb-2">📷</div>
          <h4 className="font-semibold text-green-900 mb-2">Step 2</h4>
          <p className="text-green-800">Point at the QR code</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-3xl mb-2">✨</div>
          <h4 className="font-semibold text-purple-900 mb-2">Step 3</h4>
          <p className="text-purple-800">Tap the notification to book</p>
        </div>
      </div>
    </div>
  );
};
