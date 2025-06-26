
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReliableQRGeneratorProps {
  businessId: string;
  businessName: string;
}

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const ReliableQRGenerator: React.FC<ReliableQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Generate reliable booking URL
  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  // Force QR code regeneration
  const regenerateQR = async () => {
    setQrGenerated(false);
    setValidationStatus('pending');
    await validateAndGenerateQR();
  };

  // Validate business ID and generate QR code
  const validateAndGenerateQR = async () => {
    console.log('QR Generator: Starting validation for business:', businessId);
    
    if (!businessId) {
      console.log('QR Generator: No business ID provided');
      setValidationStatus('invalid');
      return;
    }

    // First validate UUID format
    if (!isValidUUID(businessId)) {
      console.log('QR Generator: Invalid UUID format');
      setValidationStatus('invalid');
      toast.error('Invalid business ID format');
      return;
    }

    setIsValidating(true);
    
    try {
      // Validate business exists and is active
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data found

      if (error) {
        console.error('QR Generator: Database error:', error);
        setValidationStatus('invalid');
        toast.error('Failed to validate business');
        return;
      }

      if (!business) {
        console.log('QR Generator: Business not found');
        setValidationStatus('invalid');
        toast.error('Business not found');
        return;
      }

      if (!business.is_active) {
        console.log('QR Generator: Business is inactive');
        setValidationStatus('invalid');
        toast.error('Business is inactive');
        return;
      }

      console.log('QR Generator: Business validated successfully:', business.name);
      setValidationStatus('valid');

      // Generate QR code with high error correction
      // Wait for canvas to be available with retry logic
      let canvasReady = false;
      for (let attempt = 0; attempt < 10; attempt++) {
        if (canvasRef.current) {
          canvasReady = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!canvasReady) {
        throw new Error('Canvas element not available after waiting');
      }
      
      console.log('QR Generator: Generating QR code for URL:', bookingUrl);
      
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H', // 30% error correction
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrGenerated(true);
      console.log('QR Generator: QR code generated successfully');
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('QR Generator: Validation error:', error);
      setValidationStatus('invalid');
      toast.error('Failed to validate business');
    } finally {
      setIsValidating(false);
    }
  };

  // Validate business ID and generate QR code on mount
  useEffect(() => {
    // Add a small delay to ensure the canvas is mounted before generating QR
    const timer = setTimeout(() => {
      validateAndGenerateQR();
    }, 100);
    
    return () => clearTimeout(timer);
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
        // User cancelled sharing or share failed
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
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
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
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Client Booking QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          {getStatusBadge()}
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerateQR}
            disabled={isValidating}
            className="h-6 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Reliable QR code for client bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {validationStatus === 'valid' && qrGenerated ? (
            <canvas 
              ref={canvasRef} 
              className="border rounded-lg shadow-sm max-w-full h-auto"
            />
          ) : (
            <div className="w-[300px] h-[300px] border rounded-lg flex items-center justify-center bg-gray-50">
              {isValidating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Generating QR code...</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">
                    {validationStatus === 'invalid' ? 'Invalid business' : 'QR code pending'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateQR}
                    className="mt-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
            {bookingUrl}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            disabled={validationStatus !== 'valid' || !qrGenerated}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Booking Link
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
            Download QR Code
          </Button>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking
          </Button>
        </div>

        {validationStatus === 'valid' && qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2 text-sm">QR Code Ready!</h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• High error correction (30% damage tolerance)</li>
              <li>• Optimized for mobile camera scanning</li>
              <li>• Works with Apple Camera, Google Lens</li>
              <li>• Points to verified business booking page</li>
            </ul>
          </div>
        )}

        {validationStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="font-medium text-red-900 mb-2 text-sm">QR Code Issues</h5>
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
