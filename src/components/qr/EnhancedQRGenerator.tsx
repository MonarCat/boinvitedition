
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const EnhancedQRGenerator: React.FC<EnhancedQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  
  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  const validateAndGenerateQR = async (skipCache = false) => {
    if (!businessId || retryCount > 3) {
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    console.log('Enhanced QR: Starting validation for business:', businessId);
    
    try {
      // First check if UUID format is valid
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(businessId)) {
        throw new Error('Invalid business ID format');
      }

      // Validate business exists and is active with retry logic
      let business = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, is_active')
          .eq('id', businessId)
          .single();

        if (!error && data) {
          business = data;
          break;
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      if (!business) {
        throw new Error('Business not found after multiple attempts');
      }

      if (!business.is_active) {
        throw new Error('Business is not active');
      }

      console.log('Enhanced QR: Business validated successfully:', business.name);
      setValidationStatus('valid');

      // Generate QR code with enhanced error correction
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, bookingUrl, {
          width: 300,
          margin: 3,
          errorCorrectionLevel: 'H', // Highest error correction
          color: {
            dark: '#1a1a1a',
            light: '#ffffff'
          },
          rendererOpts: {
            quality: 1
          }
        });
        
        setQrGenerated(true);
        setRetryCount(0);
        console.log('Enhanced QR: Generated successfully');
        
        if (retryCount > 0) {
          toast.success('QR code generated successfully after retry');
        }
      }
    } catch (error: any) {
      console.error('Enhanced QR: Validation error:', error);
      setValidationStatus('invalid');
      setRetryCount(prev => prev + 1);
      
      if (retryCount < 3) {
        toast.error(`QR generation failed. Retry ${retryCount + 1}/3`);
      } else {
        toast.error('QR code generation failed after multiple attempts');
      }
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateAndGenerateQR();
  }, [businessId]);

  const handleRetry = () => {
    setQrGenerated(false);
    setValidationStatus('pending');
    validateAndGenerateQR(true);
  };

  const downloadQR = () => {
    if (canvasRef.current && validationStatus === 'valid' && qrGenerated) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-qr-${timestamp}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      toast.success('QR code downloaded');
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
        copyUrl();
      }
    } else {
      copyUrl();
    }
  };

  const testBooking = () => {
    window.open(bookingUrl, '_blank');
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-1"></div>
          Validating...
        </Badge>
      );
    }
    
    switch (validationStatus) {
      case 'valid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed {retryCount > 0 ? `(${retryCount}/3)` : ''}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          Enhanced QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          {getStatusBadge()}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isValidating}
            className="h-6 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Reliable booking QR code for {businessName}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {validationStatus === 'valid' && qrGenerated ? (
            <div className="p-2 bg-white rounded-lg shadow-inner">
              <canvas 
                ref={canvasRef} 
                className="border-2 border-gray-100 rounded-lg max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {isValidating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Generating QR...</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-2">
                    {validationStatus === 'invalid' ? 'Generation failed' : 'QR pending'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isValidating}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {retryCount > 0 ? 'Retry' : 'Generate'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all border">
            {bookingUrl}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            disabled={validationStatus !== 'valid' || !qrGenerated}
            className="w-full"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          
          <Button 
            onClick={copyUrl} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
            className="w-full"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid' || !qrGenerated}
            className="w-full"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
            className="w-full"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Test
          </Button>
        </div>

        {validationStatus === 'valid' && qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-green-900 text-sm">QR Code Ready</h5>
            </div>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• High error correction (30% damage tolerance)</li>
              <li>• Enhanced validation with retry logic</li>
              <li>• Optimized for all camera types</li>
              <li>• Verified business booking link</li>
              <li>• Multiple download and sharing options</li>
            </ul>
          </div>
        )}

        {validationStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h5 className="font-medium text-red-900 text-sm">Generation Issues</h5>
            </div>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• Business validation failed ({retryCount}/3 attempts)</li>
              <li>• Check business status and network connection</li>
              <li>• Try the retry button or refresh the page</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
