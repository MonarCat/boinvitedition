import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Share2, Copy, QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BoinvitQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const BoinvitQRGenerator: React.FC<BoinvitQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate the booking URL - use the current domain
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  // Generate QR code on component mount
  useEffect(() => {
    if (businessId) {
      generateQRCode();
    }
  }, [businessId]);

  const generateQRCode = async () => {
    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating QR code for business:', businessId);
      console.log('Booking URL:', bookingUrl);

      // Generate the QR code
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataUrl(qrDataUrl);

      // Create branded canvas
      await createBrandedCanvas(qrDataUrl);

      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createBrandedCanvas = async (qrDataUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve();
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve();
        return;
      }

      // Set canvas dimensions
      canvas.width = 400;
      canvas.height = 520;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw QR code
      const qrImg = new Image();
      qrImg.onload = () => {
        // Boinvit branding header
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Boinvit', canvas.width / 2, 35);

        // Business name
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(businessName, canvas.width / 2, 65);

        // Custom message or default
        const message = customMessage.trim() || 'Scan to book your appointment';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(message, canvas.width / 2, 90);

        // Draw QR code
        ctx.drawImage(qrImg, 50, 110, 300, 300);

        // Instructions
        ctx.font = '12px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('1. Open your camera app', canvas.width / 2, 440);
        ctx.fillText('2. Point at the QR code', canvas.width / 2, 460);
        ctx.fillText('3. Tap to book appointment', canvas.width / 2, 480);

        // Footer
        ctx.fillStyle = '#d1d5db';
        ctx.font = '10px Arial';
        ctx.fillText('Powered by Boinvit', canvas.width / 2, 505);

        resolve();
      };

      qrImg.onerror = () => {
        console.error('Failed to load QR code image');
        resolve();
      };

      qrImg.src = qrDataUrl;
    });
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) {
      toast.error('QR code not ready for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '-')}-boinvit-qr.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    }
  };

  const copyBookingUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bookingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Booking URL copied to clipboard!');
    }
  };

  const shareQRCode = async () => {
    if (!canvasRef.current) {
      toast.error('QR code not ready for sharing');
      return;
    }

    try {
      if (navigator.share) {
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });

        const file = new File([blob], `${businessName}-boinvit-qr.png`, {
          type: 'image/png'
        });

        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Scan this QR code to book an appointment with ${businessName}`,
          files: [file]
        });
      } else {
        // Fallback to download if sharing is not supported
        downloadQRCode();
      }
    } catch (error) {
      console.error('Share error:', error);
      downloadQRCode(); // Fallback to download
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
            Generate QR codes that customers can scan to book appointments with your business
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm"><strong>Business:</strong> {businessName}</p>
            <p className="text-sm text-gray-600 break-all">
              <strong>Booking URL:</strong> {bookingUrl}
            </p>
          </div>

          {/* Custom Message Input */}
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

          {/* Generate Button */}
          <Button 
            onClick={generateQRCode} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                {qrCodeDataUrl ? 'Regenerate QR Code' : 'Generate QR Code'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrCodeDataUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Your QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <canvas 
                ref={canvasRef}
                className="border rounded-lg shadow-sm max-w-full"
                style={{ maxWidth: '300px', height: 'auto' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button onClick={downloadQRCode} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
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

            {/* Usage Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-1">How to use:</p>
              <ul className="space-y-1">
                <li>• Print and display at your business location</li>
                <li>• Share digitally on social media or website</li>
                <li>• Customers scan with their phone camera</li>
                <li>• They'll be redirected to your booking page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
