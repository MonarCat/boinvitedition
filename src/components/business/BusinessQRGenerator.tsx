
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, Copy, ExternalLink, Share2, RefreshCw, Printer } from 'lucide-react';
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  const generateQR = async () => {
    if (!canvasRef.current || !businessId) return;
    
    setIsGenerating(true);
    setQrGenerated(false);
    
    try {
      // Generate QR code with high quality settings
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 300,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      // Get data URL for downloading
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      setQrDataUrl(dataUrl);
      setQrGenerated(true);
      
      console.log('QR Code generated successfully for:', bookingUrl);
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      generateQR();
    }
  }, [bookingUrl, businessId]);

  const downloadQR = () => {
    if (qrGenerated && qrDataUrl) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName}-booking-qr-${timestamp}.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded successfully');
    }
  };

  const printQR = () => {
    if (qrGenerated && qrDataUrl) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>QR Code - ${businessName}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
              h2 { color: #333; margin-bottom: 10px; }
              p { color: #666; margin: 5px 0; }
            </style>
          </head>
          <body>
            <h2>${businessName}</h2>
            <p>Scan to Book Services</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <p>${bookingUrl}</p>
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
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
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center justify-center gap-2 text-lg text-blue-800">
          <QrCode className="w-5 h-5 text-blue-600" />
          Client Booking QR Code
        </CardTitle>
        <p className="text-sm text-blue-600 font-medium">
          Share this QR code for easy bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-xl shadow-inner">
          {qrGenerated ? (
            <div className="text-center">
              <canvas 
                ref={canvasRef} 
                className="max-w-full h-auto border border-gray-100 rounded-lg shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-2">High-quality QR code ready</p>
            </div>
          ) : (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600 font-medium">Generating QR Code...</p>
                  <p className="text-xs text-gray-500 mt-1">Please wait a moment</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-3 font-medium">QR Code will appear here</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateQR}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate QR Code
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Booking URL Display */}
        <div className="text-center bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Booking URL:</p>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs font-mono break-all text-gray-700 leading-relaxed">
              {bookingUrl}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
            className="hover:bg-gray-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
            className="hover:bg-green-50 hover:border-green-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            onClick={printQR} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
            className="hover:bg-purple-50 hover:border-purple-200"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
            className="w-full hover:bg-indigo-50 hover:border-indigo-200"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking Page
          </Button>
        </div>

        {/* Success Message */}
        {qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 text-sm font-semibold mb-2">
              <QrCode className="w-4 h-4" />
              QR Code Ready for Use!
            </div>
            <ul className="text-xs text-green-700 space-y-1.5">
              <li>• Customers can scan to book instantly</li>
              <li>• Works with any camera app or QR scanner</li>
              <li>• High-quality error correction built-in</li>
              <li>• Download or print for offline sharing</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
