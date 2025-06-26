import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { validateBusiness } from '@/utils/qrValidation';

interface ReliableQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const ReliableQRGenerator: React.FC<ReliableQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  const validateAndGenerateQR = async () => {
    if (!businessId) {
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    setQrGenerated(false);
    
    try {
      const validation = await validateBusiness(businessId);
      
      if (!validation.isValid) {
        setValidationStatus('invalid');
        toast.error(validation.error || 'Business validation failed');
        return;
      }

      setValidationStatus('valid');
      
      // Generate QR code with enhanced settings
      if (canvasRef.current) {
        setIsGenerating(true);
        await QRCode.toCanvas(canvasRef.current, bookingUrl, {
          width: 320,
          margin: 3,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        
        // Store data URL for download/print
        const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
        setQrDataUrl(dataUrl);
        setQrGenerated(true);
        
        console.log('QR Generator: QR code generated successfully');
        toast.success('QR code generated successfully');
      }
    } catch (error) {
      console.error('QR Generator: Validation error:', error);
      setValidationStatus('invalid');
      toast.error('Failed to validate business');
    } finally {
      setIsValidating(false);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      validateAndGenerateQR();
    }
  }, [businessId]);

  const downloadQR = () => {
    if (validationStatus === 'valid' && qrGenerated && qrDataUrl) {
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
    if (validationStatus === 'valid' && qrGenerated && qrDataUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - ${businessName}</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
                .container { border: 1px solid #ccc; padding: 20px; display: inline-block; border-radius: 8px; }
                h1 { text-transform: uppercase; font-size: 24px; margin: 0 0 10px; }
                h2 { font-size: 18px; margin: 0 0 20px; color: #333; }
                img { width: 300px; height: 300px; }
                p { font-size: 14px; color: #555; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>SCAN TO BOOK</h1>
                <h2>${businessName}</h2>
                <img src="${qrDataUrl}" alt="QR Code for ${businessName}" />
                <p>Point your camera at the QR code to book your appointment instantly.</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        toast.error('Could not open print window. Please disable pop-up blockers.');
      }
    }
  };

  const copyUrl = async () => {
    if (validationStatus !== 'valid') {
      toast.error('Cannot copy invalid booking URL');
      return;
    }

    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const shareUrl = async () => {
    if (validationStatus !== 'valid') {
      toast.error('Cannot share invalid booking URL');
      return;
    }

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
    if (validationStatus === 'valid') {
      window.open(bookingUrl, '_blank');
    } else {
      toast.error('Cannot test invalid booking URL');
    }
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return <Badge variant="secondary">Validating...</Badge>;
    }
    
    switch (validationStatus) {
      case 'valid':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Invalid
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center justify-center gap-2 text-lg text-blue-800">
          <QrCode className="w-5 h-5 text-blue-600" />
          Business QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          {getStatusBadge()}
          <Button
            variant="ghost"
            size="sm"
            onClick={validateAndGenerateQR}
            disabled={isValidating || isGenerating}
            className="h-6 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isValidating || isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-blue-600 font-medium">
          Validated QR code for client bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-xl shadow-inner">
          {validationStatus === 'valid' && qrGenerated ? (
            <div className="text-center">
              <canvas 
                ref={canvasRef} 
                className="max-w-full h-auto border border-gray-100 rounded-lg shadow-sm"
              />
              <p className="text-xs text-green-600 mt-2 font-medium">✓ Ready for use</p>
            </div>
          ) : (
            <div className="w-[320px] h-[320px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {isValidating || isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600 font-medium">
                    {isValidating ? 'Validating business...' : 'Generating QR code...'}
                  </p>
                </div>
              ) : (
                <div className="text-center p-4">
                  {validationStatus === 'invalid' ? (
                    <>
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-sm text-red-600 mb-3 font-medium">Business validation failed</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-3 font-medium">Ready to generate QR code</p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateAndGenerateQR}
                    className="mt-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {validationStatus === 'invalid' ? 'Retry' : 'Generate'}
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
            className="bg-blue-600 hover:bg-blue-700"
            disabled={validationStatus !== 'valid' || !qrGenerated}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button 
            onClick={copyUrl} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
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
            className="w-full"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>

          <Button 
            onClick={printQR} 
            variant="outline" 
            size="sm"
            disabled={!qrGenerated}
            className="w-full"
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>
        </div>

        <Button 
          onClick={testBooking} 
          variant="outline" 
          size="sm"
          disabled={validationStatus !== 'valid'}
          className="w-full hover:bg-indigo-50 hover:border-indigo-200"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Test Booking Page
        </Button>

        {/* Status Messages */}
        {validationStatus === 'valid' && qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              QR Code Active & Verified!
            </h5>
            <ul className="text-xs text-green-800 space-y-1.5">
              <li>• High error correction (30% damage tolerance)</li>
              <li>• Optimized for mobile camera scanning</li>
              <li>• Points to verified business booking page</li>
              <li>• Download or print for offline sharing</li>
            </ul>
          </div>
        )}

        {validationStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Validation Failed
            </h5>
            <ul className="text-xs text-red-800 space-y-1.5">
              <li>• Business ID is invalid or business not found</li>
              <li>• Ensure business is active and published</li>
              <li>• Contact support if problem persists</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
