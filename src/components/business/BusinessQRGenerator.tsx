
import React, { useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const BusinessQRGenerator: React.FC<BusinessQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the correct booking URL format that matches our routing
  const bookingUrl = `${window.location.origin}/app/book/${businessId}`;
  
  React.useEffect(() => {
    if (canvasRef.current && businessId) {
      QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
          toast.error('Failed to generate QR code');
        }
      });
    }
  }, [bookingUrl, businessId]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${businessName}-booking-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success('QR code downloaded successfully');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const testBooking = () => {
    window.open(bookingUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Booking QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share this QR code for instant bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="border rounded-lg shadow-sm"
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
            {bookingUrl}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={downloadQR} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
          
          <Button onClick={copyUrl} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy Booking URL
          </Button>
          
          <Button onClick={testBooking} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking Page
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Customers can scan this QR code to book your services instantly</p>
        </div>
      </CardContent>
    </Card>
  );
};
