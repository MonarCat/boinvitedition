
import React, { useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Copy, ExternalLink, Share2 } from 'lucide-react';
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
  
  // Direct booking URL for QR code
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  React.useEffect(() => {
    if (canvasRef.current && businessId) {
      QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
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
      link.download = `${businessName.replace(/\s+/g, '-')}-booking-qr.png`;
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

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book ${businessName}`,
          text: `Book services with ${businessName}`,
          url: bookingUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyUrl();
    }
  };

  const testBooking = () => {
    window.open(bookingUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          Client Booking QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Clients scan this QR code to book your services instantly
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-gray-100">
            <canvas 
              ref={canvasRef} 
              className="rounded"
            />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono break-all border">
            {bookingUrl}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={shareUrl} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          
          <Button onClick={copyUrl} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
          
          <Button onClick={downloadQR} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
          
          <Button onClick={testBooking} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2 text-sm">How to Use</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Print the QR code on business cards or posters</li>
            <li>• Share the URL via WhatsApp or social media</li>
            <li>• Clients can book services directly from the link</li>
            <li>• No app download required for clients</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
