
import React from 'react';
import { ProductionQRScanner } from '@/components/qr/ProductionQRScanner';
import { ProductionWhatsAppButton } from '@/components/ui/ProductionWhatsAppButton';

const QRScannerPage = () => {
  const handleScanSuccess = (url: string) => {
    console.log('QR Scan successful:', url);
    // Additional handling if needed
  };

  const handleScanError = (error: string) => {
    console.log('QR Scan error:', error);
    // Additional error handling if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Code Scanner
          </h1>
          <p className="text-gray-600">
            Scan QR codes to quickly book services
          </p>
        </div>
        
        <ProductionQRScanner 
          onScanSuccess={handleScanSuccess}
          onError={handleScanError}
        />
        
        {/* Help Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-3">How to use QR Scanner</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Allow camera access when prompted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Point your camera at a QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Wait for automatic detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Tap to open the booking page</span>
              </li>
            </ul>
          </div>
          
          <ProductionWhatsAppButton 
            variant="card"
            message="Hello! I need help with scanning QR codes on Boinvit."
          />
        </div>
      </div>
      
      <ProductionWhatsAppButton />
    </div>
  );
};

export default QRScannerPage;
