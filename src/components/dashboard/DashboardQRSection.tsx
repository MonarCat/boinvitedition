
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
          Service Booking QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Clean and reliable QR code for customers to easily book your services
        </p>
      </CardHeader>
      <CardContent>
        <QRCodeGenerator 
          businessId={business.id} 
          businessName={business.name || 'Your Business'}
          className="max-w-md mx-auto"
        />
      </CardContent>
    </Card>
  );
};
