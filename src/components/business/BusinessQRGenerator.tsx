
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2, RefreshCw, TestTube } from 'lucide-react';
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
  const [debugMode, setDebugMode] = useState(false);

  // Use the correct production URL structure for booking
  const bookingUrl = `https://boinvit.com/book/${businessId}`;
  
  // Fallback to services page if direct booking fails
  const servicesUrl = `https://boinvit.com/services`;

  const generateQRCode = async (useServicesUrl = false) => {
    setIsGenerating(true);
    try {
      const targetUrl = useServicesUrl ? servicesUrl : bookingUrl;
      
      // Generate QR with high error correction and optimal size
      const dataUrl = await QRCodeLib.toDataURL(targetUrl, {
        width: 500, // Increased from 300 for better scanning
        margin: 3,  // Increased margin for better scanning
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction (30% recovery)
      });
      
      setQrDataUrl(dataUrl);
      toast.success(`QR code generated successfully! URL: ${targetUrl}`);
      
      if (debugMode) {
        console.log('QR Code generated for URL:', targetUrl);
        console.log('QR Code data URL length:', dataUrl.length);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const testQRCodeURL = () => {
    // Open the URL in a new tab for testing
    window.open(bookingUrl, '_blank');
    toast.info('Testing QR code URL in new tab');
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${businessName.replace(/\s+/g, '_')}_booking_qr_500px.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('High-resolution QR code downloaded!');
  };

  const shareQRCode = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${businessName}_booking_qr.png`, { type: 'image/png' });
        
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
          Business QR Code - High Resolution
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate a high-quality QR code for clients to book appointments directly
        </p>
        {debugMode && (
          <div className="bg-yellow-50 p-2 rounded border text-xs">
            <strong>Debug Info:</strong><br />
            Target URL: {bookingUrl}<br />
            Fallback URL: {servicesUrl}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          {qrDataUrl ? (
            <div className="space-y-4">
              <img 
                src={qrDataUrl} 
                alt="Business QR Code" 
                className="mx-auto border rounded-lg shadow-sm max-w-full h-auto"
                style={{ maxWidth: '300px' }}
              />
              <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
                Primary: {bookingUrl}<br />
                Fallback: {servicesUrl}
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

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => generateQRCode(false)} 
            disabled={isGenerating}
            variant="outline"
            className="flex-1 min-w-0"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          
          <Button 
            onClick={() => generateQRCode(true)} 
            disabled={isGenerating}
            variant="outline"
            className="flex-1 min-w-0"
            title="Generate QR for services page (fallback)"
          >
            Services QR
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testQRCodeURL} 
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <TestTube className="w-4 h-4 mr-1" />
            Test URL
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

          <Button 
            onClick={() => setDebugMode(!debugMode)} 
            variant="ghost"
            size="sm"
          >
            Debug
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p><strong>📱 Print Instructions:</strong></p>
          <p>• Use high-resolution download (500x500px)</p>
          <p>• Print size: minimum 2x2 inches for reliable scanning</p>
          <p>• Test with multiple devices before displaying</p>
          <p>• Place at eye level with good lighting</p>
        </div>

        <div className="bg-blue-50 p-3 rounded text-xs">
          <p><strong>🔧 Troubleshooting Tips:</strong></p>
          <p>1. Test the "Test URL" button first</p>
          <p>2. Use "Services QR" if direct booking fails</p>
          <p>3. Enable "Debug" mode for detailed info</p>
          <p>4. Ensure your booking page is mobile-responsive</p>
        </div>
      </CardContent>
    </Card>
  );
};
