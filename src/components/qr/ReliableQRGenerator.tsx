
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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
      
      // Generate QR code
      if (canvasRef.current) {
        setIsGenerating(true);
        await QRCode.toCanvas(canvasRef.current, bookingUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        
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
    validateAndGenerateQR();
  }, [businessId]);

  const downloadQR = () => {
    if (canvasRef.current && validationStatus === 'valid' && qrGenerated) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName}-booking-qr-${timestamp}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      toast.success('QR code downloaded successfully');
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <QrCode className="w-5 h-5 text-blue-600" />
          Business QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
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
        <p className="text-sm text-gray-600">
          Validated QR code for client bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
          {validationStatus === 'valid' && qrGenerated ? (
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto"
            />
          ) : (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              {isValidating || isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {isValidating ? 'Validating business...' : 'Generating QR code...'}
                  </p>
                </div>
              ) : (
                <div className="text-center p-4">
                  {validationStatus === 'invalid' ? (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600 mb-2">Business validation failed</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Ready to generate QR code</p>
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
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid' || !qrGenerated}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test
          </Button>
        </div>

        {/* Status Messages */}
        {validationStatus === 'valid' && qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              QR Code Active!
            </h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• High error correction (30% damage tolerance)</li>
              <li>• Optimized for mobile camera scanning</li>
              <li>• Points to verified business booking page</li>
              <li>• Ready to share with customers</li>
            </ul>
          </div>
        )}

        {validationStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="font-medium text-red-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Validation Failed
            </h5>
            <ul className="text-xs text-red-800 space-y-1">
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
