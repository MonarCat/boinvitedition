
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { QrCode } from 'lucide-react';

interface DashboardQRSectionProps {
  business: any;
}

export const DashboardQRSection: React.FC<DashboardQRSectionProps> = ({
  business
}) => {
  if (!business) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate QR codes for customer bookings
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <QRCodeGenerator 
            businessId={business.id} 
            businessName={business.name || 'Your Business'}
            showTitle={false}
          />
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">QR Code Information</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Permanent URL:</strong> {window.location.origin}/book/{business.id}</p>
              <p>This QR code is permanent and will continue to work even if you update your business details.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">High Error Correction</div>
              <div className="text-xs text-green-700">Up to 30% damage recovery</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold">Universal Compatible</div>
              <div className="text-xs text-purple-700">Works on all devices</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">Reliable Generation</div>
              <div className="text-xs text-blue-700">Enhanced validation</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
