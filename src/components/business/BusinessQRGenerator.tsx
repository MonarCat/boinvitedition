
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2 } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { toast } from 'sonner';

interface BusinessQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const BusinessQRGenerator: React.FC<BusinessQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Use production domain
  const bookingUrl = `https://boinvit.com/book/${businessId}`;

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await QRCodeLib.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(dataUrl);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${businessName.replace(/\s+/g, '_')}_booking_qr.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const shareQRCode = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${businessName}_qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Scan this QR code to book an appointment with ${businessName}`,
          files: [file],
          url: bookingUrl
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
        // Fallback to copying URL
        navigator.clipboard.writeText(bookingUrl);
        toast.success('Booking URL copied to clipboard!');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard!');
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [businessId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Business QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate a QR code for clients to book appointments directly
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          {qrDataUrl ? (
            <div className="space-y-4">
              <img 
                src={qrDataUrl} 
                alt="Business QR Code" 
                className="mx-auto border rounded-lg shadow-sm"
              />
              <div className="text-xs text-gray-500 break-all">
                {bookingUrl}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">QR Code will appear here</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateQRCode} 
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          
          <Button 
            onClick={downloadQRCode} 
            disabled={!qrDataUrl}
            variant="outline"
            size="icon"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={shareQRCode} 
            disabled={!qrDataUrl}
            variant="outline"
            size="icon"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Print and display this QR code at your business location</p>
          <p>Clients can scan to book appointments instantly</p>
        </div>
      </CardContent>
    </Card>
  );
};
