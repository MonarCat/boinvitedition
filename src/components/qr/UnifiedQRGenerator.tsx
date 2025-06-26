
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedQRGeneratorProps {
  businessId: string;
  businessName: string;
  showTitle?: boolean;
}

export const UnifiedQRGenerator: React.FC<UnifiedQRGeneratorProps> = ({
  businessId,
  businessName,
  showTitle = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  
  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  useEffect(() => {
    const validateAndGenerateQR = async () => {
      if (!businessId) {
        setValidationStatus('invalid');
        return;
      }

      setIsValidating(true);
      
      try {
        const { data: business, error } = await supabase
          .from('businesses')
          .select('id, name, is_active')
          .eq('id', businessId)
          .eq('is_active', true)
          .single();

        if (error || !business) {
          setValidationStatus('invalid');
          return;
        }

        setValidationStatus('valid');

        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, bookingUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        }
      } catch (error) {
        console.error('QR validation error:', error);
        setValidationStatus('invalid');
      } finally {
        setIsValidating(false);
      }
    };

    validateAndGenerateQR();
  }, [businessId, bookingUrl]);

  const downloadQR = () => {
    if (canvasRef.current && validationStatus === 'valid') {
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
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Service Booking QR Code
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600">
            Customers can scan this to book your services
          </p>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {validationStatus === 'valid' ? (
            <canvas 
              ref={canvasRef} 
              className="border rounded-lg shadow-sm max-w-full h-auto"
            />
          ) : (
            <div className="w-[300px] h-[300px] border rounded-lg flex items-center justify-center bg-gray-50">
              {isValidating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Validating...</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Invalid business ID</p>
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

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            disabled={validationStatus !== 'valid'}
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
            Copy
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
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

        {validationStatus === 'valid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2 text-sm">QR Code Active!</h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Share with customers for easy booking</li>
              <li>• Works with all mobile camera apps</li>
              <li>• Displays your services and booking form</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
