
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Copy, ExternalLink, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const EnhancedQRGenerator: React.FC<EnhancedQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  
  // Use the correct booking URL format
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current && businessId) {
        try {
          setQrError(null);
          await QRCode.toCanvas(canvasRef.current, bookingUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrGenerated(true);
          console.log('QR Code generated successfully for:', bookingUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          setQrError('Failed to generate QR code');
          toast.error('Failed to generate QR code');
        }
      }
    };

    generateQR();
  }, [bookingUrl, businessId]);

  const downloadQR = () => {
    if (canvasRef.current && qrGenerated) {
      try {
        const link = document.createElement('a');
        link.download = `${businessName}-booking-qr.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
        toast.success('QR code downloaded successfully');
      } catch (error) {
        toast.error('Failed to download QR code');
      }
    } else {
      toast.error('QR code not ready for download');
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

  const retryGeneration = () => {
    setQrError(null);
    setQrGenerated(false);
    // Trigger regeneration by calling useEffect
    if (canvasRef.current && businessId) {
      QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(() => {
        setQrGenerated(true);
        toast.success('QR code regenerated successfully');
      }).catch((error) => {
        console.error('Error regenerating QR code:', error);
        setQrError('Failed to regenerate QR code');
        toast.error('Failed to regenerate QR code');
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Client Booking Access
          {qrGenerated && <CheckCircle className="w-4 h-4 text-green-600" />}
          {qrError && <AlertCircle className="w-4 h-4 text-red-600" />}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Multiple ways for clients to book your services
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{qrError}</span>
            </div>
            <Button 
              onClick={retryGeneration} 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              Retry Generation
            </Button>
          </div>
        )}
        
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="border rounded-lg shadow-sm"
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
            {bookingUrl}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={shareUrl} variant="default" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Booking Link
          </Button>
          
          <Button onClick={copyUrl} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
          
          <Button onClick={testBooking} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-900 mb-2 text-sm">Sharing Options</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Share the link via WhatsApp, SMS, or email</li>
            <li>• Post on social media platforms</li>
            <li>• Print the QR code on business cards</li>
            <li>• Add to your website or email signature</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
