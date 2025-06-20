
import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, QrCode, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ReliableQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const ReliableQRGenerator: React.FC<ReliableQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  useEffect(() => {
    // Auto-generate QR code when component mounts
    generateQRCode();
  }, [businessId]);

  const generateQRCode = async () => {
    if (!businessId) {
      toast.error('Business ID is required to generate QR code');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating QR code for business:', businessId);
      console.log('Booking URL:', bookingUrl);
      
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrDataUrl);
      
      // Generate branded canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 400;
          canvas.height = 500;
          
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Boinvit branding
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Boinvit', canvas.width / 2, 30);
          
          // Business name
          ctx.font = 'bold 18px Arial';
          ctx.fillText(businessName, canvas.width / 2, 55);
          
          // QR Code
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, 50, 80, 300, 300);
            
            // Instructions
            ctx.font = '14px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Scan to book your appointment', canvas.width / 2, 410);
            ctx.fillText('Powered by Boinvit', canvas.width / 2, 430);
            
            // URL
            ctx.font = '10px Arial';
            ctx.fillText(bookingUrl, canvas.width / 2, 450);
          };
          qrImg.src = qrDataUrl;
        }
      }
      
      console.log('QR code generated successfully');
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '-')}-boinvit-qr.png`;
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
        
        const file = new File([blob], `${businessName}-boinvit-qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Scan this QR code to book an appointment with ${businessName} on Boinvit`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        downloadQRCode();
      }
    } else {
      downloadQRCode();
    }
  };

  const previewQRCode = () => {
    if (qrCodeUrl) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${businessName} - Boinvit QR Code</title></head>
            <body style="margin:0;padding:20px;text-align:center;font-family:Arial">
              <h2>${businessName}</h2>
              <p>Scan to book your appointment</p>
              <img src="${qrCodeUrl}" style="max-width:100%;height:auto;"/>
              <p style="font-size:12px;color:#666;">Powered by Boinvit</p>
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Generator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate QR codes for your business that customers can scan to book appointments
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p><strong>Business:</strong> {businessName}</p>
            <p><strong>Booking URL:</strong> {bookingUrl}</p>
          </div>

          {qrCodeUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <canvas 
                  ref={canvasRef}
                  className="border rounded-lg shadow-sm"
                  style={{ maxWidth: '300px', height: 'auto' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={previewQRCode} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={shareQRCode} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button onClick={copyBookingUrl} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600">Generating QR code...</p>
                </div>
              ) : (
                <Button onClick={generateQRCode} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
