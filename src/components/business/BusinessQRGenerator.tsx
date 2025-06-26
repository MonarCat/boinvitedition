
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Copy, ExternalLink, Share2, RefreshCw } from 'lucide-react';
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
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  const generateQR = async () => {
    if (!canvasRef.current || !businessId) return;
    
    setIsGenerating(true);
    setQrGenerated(false);
    
    try {
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrGenerated(true);
      console.log('QR Code generated successfully for:', bookingUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [bookingUrl, businessId]);

  const downloadQR = () => {
    if (canvasRef.current && qrGenerated) {
      const link = document.createElement('a');
      link.download = `${businessName}-booking-qr.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
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
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <QrCode className="w-5 h-5 text-blue-600" />
          Client Booking QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share this QR code for easy bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
          {qrGenerated ? (
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto"
            />
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-50 rounded-lg">
              {isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Generating QR Code...</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">QR Code will appear here</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateQR}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Booking URL Display */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2 font-medium">Booking URL:</p>
          <div className="bg-gray-100 p-3 rounded-lg border">
            <p className="text-xs font-mono break-all text-gray-700">
              {bookingUrl}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!qrGenerated}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button 
            onClick={copyUrl} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
          >
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
            Download
          </Button>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test
          </Button>
        </div>

        {/* Success Message */}
        {qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
              <QrCode className="w-4 h-4" />
              QR Code Ready!
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Customers can scan to book instantly</li>
              <li>• Works with any camera app</li>
              <li>• High-quality error correction</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
