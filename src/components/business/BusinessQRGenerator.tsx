
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2, RefreshCw, TestTube, ExternalLink } from 'lucide-react';
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
  const debugBookingUrl = `https://boinvit.com/book/${businessId}?qr_debug=1`;
  
  // Fallback to services page if direct booking fails
  const servicesUrl = `https://boinvit.com/services`;

  const generateQRCode = async (useServicesUrl = false, includeDebug = false) => {
    setIsGenerating(true);
    try {
      let targetUrl = useServicesUrl ? servicesUrl : bookingUrl;
      if (includeDebug && !useServicesUrl) {
        targetUrl = debugBookingUrl;
      }
      
      // Generate QR with maximum error correction and optimal size for scanning
      const dataUrl = await QRCodeLib.toDataURL(targetUrl, {
        width: 800, // Increased to 800px for ultra-high resolution
        margin: 4,  // Increased margin for better scanning reliability
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H', // Highest error correction (30% recovery)
        type: 'image/png',
        quality: 1.0 // Maximum quality
      });
      
      setQrDataUrl(dataUrl);
      toast.success(`High-resolution QR code generated! Target: ${targetUrl}`);
      
      if (debugMode) {
        console.log('QR Code generated successfully');
        console.log('Target URL:', targetUrl);
        console.log('Business ID:', businessId);
        console.log('QR Data URL length:', dataUrl.length);
        console.log('Error correction level: H (30%)');
        console.log('Size: 800x800px');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const testQRCodeURL = () => {
    // Open the URL in a new tab for testing
    window.open(bookingUrl, '_blank');
    toast.info('Testing QR code URL in new tab');
  };

  const testDebugURL = () => {
    // Open the debug URL in a new tab
    window.open(debugBookingUrl, '_blank');
    toast.info('Testing QR code URL with debug mode');
  };

  const downloadQRCode = (resolution = 'high') => {
    if (!qrDataUrl) return;
    
    const filename = resolution === 'ultra' 
      ? `${businessName.replace(/\s+/g, '_')}_booking_qr_800px_ultra.png`
      : `${businessName.replace(/\s+/g, '_')}_booking_qr_high_res.png`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Ultra high-resolution QR code downloaded: ${filename}`);
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

  const validateQRCode = () => {
    // Open external QR code validator
    const validatorUrl = `https://zxing.org/w/decode.jsp`;
    window.open(validatorUrl, '_blank');
    toast.info('Opening QR code validator - upload your QR image to test');
  };

  useEffect(() => {
    // Generate initial QR code with highest quality
    generateQRCode(false, false);
  }, [businessId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Ultra High-Quality Business QR Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate an ultra high-resolution QR code (800x800px) with maximum error correction for reliable scanning
        </p>
        {debugMode && (
          <div className="bg-blue-50 p-3 rounded border text-xs space-y-1">
            <strong>🔧 Debug Information:</strong><br />
            <span className="font-mono">Primary URL: {bookingUrl}</span><br />
            <span className="font-mono">Debug URL: {debugBookingUrl}</span><br />
            <span className="font-mono">Fallback URL: {servicesUrl}</span><br />
            <span className="font-mono">Business ID: {businessId}</span><br />
            <span className="font-mono">Resolution: 800x800px</span><br />
            <span className="font-mono">Error Correction: H (30%)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          {qrDataUrl ? (
            <div className="space-y-4">
              <img 
                src={qrDataUrl} 
                alt="Business QR Code" 
                className="mx-auto border-2 border-gray-200 rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxWidth: '350px' }}
              />
              <div className="text-xs text-gray-500 break-all bg-gray-50 p-3 rounded border">
                <p><strong>Primary:</strong> {bookingUrl}</p>
                <p><strong>Debug:</strong> {debugBookingUrl}</p>
                <p><strong>Fallback:</strong> {servicesUrl}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Ultra High-Quality QR Code</p>
                <p className="text-gray-400 text-sm">800x800px • Error Correction Level H</p>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => generateQRCode(false, false)} 
            disabled={isGenerating}
            variant="default"
            className="h-12"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Regenerate QR'}
          </Button>
          
          <Button 
            onClick={() => generateQRCode(false, true)} 
            disabled={isGenerating}
            variant="outline"
            className="h-12"
            title="Generate QR with debug mode enabled"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Debug QR
          </Button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button 
            onClick={testQRCodeURL} 
            variant="outline"
            size="sm"
            title="Test the booking URL directly"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Test
          </Button>
          
          <Button 
            onClick={testDebugURL} 
            variant="outline"
            size="sm"
            title="Test with debug information"
          >
            <TestTube className="w-4 h-4 mr-1" />
            Debug
          </Button>
          
          <Button 
            onClick={() => downloadQRCode('ultra')} 
            disabled={!qrDataUrl}
            variant="outline"
            size="sm"
            title="Download ultra high-resolution QR code"
          >
            <Download className="w-4 h-4 mr-1" />
            800px
          </Button>
          
          <Button 
            onClick={shareQRCode} 
            disabled={!qrDataUrl}
            variant="outline"
            size="sm"
            title="Share QR code"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Utility Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => generateQRCode(true)} 
            disabled={isGenerating}
            variant="secondary"
            size="sm"
            className="flex-1"
            title="Generate QR for services page (fallback option)"
          >
            Fallback QR (Services)
          </Button>
          
          <Button 
            onClick={validateQRCode} 
            variant="outline"
            size="sm"
            title="Open external QR code validator"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Validate
          </Button>

          <Button 
            onClick={() => setDebugMode(!debugMode)} 
            variant={debugMode ? "default" : "ghost"}
            size="sm"
          >
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </Button>
        </div>

        {/* Enhanced Instructions */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">📱 Optimal Printing & Display Guidelines:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• <strong>Resolution:</strong> Use 800x800px download for crystal-clear prints</p>
            <p>• <strong>Print Size:</strong> Minimum 3×3 inches (7.5×7.5 cm) for reliable scanning</p>
            <p>• <strong>Error Recovery:</strong> 30% of QR code can be damaged and still scan</p>
            <p>• <strong>Contrast:</strong> Black on white background for maximum compatibility</p>
            <p>• <strong>Placement:</strong> Eye level, good lighting, avoid reflective surfaces</p>
            <p>• <strong>Testing:</strong> Always test with multiple devices before final deployment</p>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">🔧 Troubleshooting Quick Fixes:</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <p>1. <strong>QR won't scan:</strong> Use "Debug QR" to test with diagnostic info</p>
            <p>2. <strong>Page not found:</strong> Click "Test" button to verify URL works</p>
            <p>3. <strong>Quality issues:</strong> Download 800px version for printing</p>
            <p>4. <strong>Validation:</strong> Use "Validate" button to check QR content</p>
            <p>5. <strong>Backup option:</strong> Use "Fallback QR" if main booking fails</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            QR Code URL: <span className="font-mono">{bookingUrl}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
