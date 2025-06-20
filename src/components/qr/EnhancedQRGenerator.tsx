
import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Share2, Copy, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const EnhancedQRGenerator: React.FC<EnhancedQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeUrl(qrDataUrl);
      
      // Generate canvas with business branding
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 500;
          canvas.height = 600;
          
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Business name header
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(businessName, canvas.width / 2, 40);
          
          // Custom message or default
          const message = customMessage || 'Scan to book your appointment';
          ctx.font = '16px Arial';
          ctx.fillText(message, canvas.width / 2, 70);
          
          // QR Code
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, 50, 100, 400, 400);
            
            // Instructions
            ctx.font = '14px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('1. Open your camera app', canvas.width / 2, 530);
            ctx.fillText('2. Point at the QR code', canvas.width / 2, 550);
            ctx.fillText('3. Tap the notification to book', canvas.width / 2, 570);
          };
          qrImg.src = qrDataUrl;
        }
      }
      
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '-')}-booking-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success('QR code downloaded!');
    }
  };

  const copyBookingUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!));
        });
        
        const file = new File([blob], `${businessName}-booking-qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Scan this QR code to book an appointment with ${businessName}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        downloadQRCode(); // Fallback to download
      }
    } else {
      downloadQRCode(); // Fallback to download
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Enhanced QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="booking-url">Your Booking URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="booking-url"
                value={bookingUrl}
                readOnly
                className="bg-gray-50"
              />
              <Button onClick={copyBookingUrl} variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Input
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Scan to book your appointment"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={generateQRCode} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Your Branded QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <canvas 
                ref={canvasRef}
                className="border rounded-lg shadow-sm max-w-full h-auto"
                style={{ maxWidth: '300px' }}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={downloadQRCode} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareQRCode} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 text-center">
              <p>Print this QR code and display it at your business location.</p>
              <p>Customers can scan it to view your services and book appointments.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
