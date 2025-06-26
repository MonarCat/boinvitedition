import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ConsolidatedQRGeneratorProps {
  businessId: string;
  businessName: string;
  showTitle?: boolean;
}

export const ConsolidatedQRGenerator: React.FC<ConsolidatedQRGeneratorProps> = ({
  businessId,
  businessName,
  showTitle = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  // Ensure canvas is ready before generating QR
  useEffect(() => {
    const checkCanvas = () => {
      if (canvasRef.current) {
        setCanvasReady(true);
      } else {
        setTimeout(checkCanvas, 100);
      }
    };
    checkCanvas();
  }, []);

  const validateAndGenerateQR = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      console.log('QR Generator: Starting validation for business:', businessId);
      
      if (!businessId) {
        throw new Error('No business ID provided');
      }
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(businessId)) {
        throw new Error('Invalid business ID format');
      }

      // Wait for canvas to be ready
      if (!canvasReady || !canvasRef.current) {
        throw new Error('Canvas not initialized');
      }

      // Validate business exists and is active with simplified query
      const { data: business, error: supabaseError } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .maybeSingle();

      if (supabaseError) {
        console.error('QR Generator: Database error:', supabaseError);
        throw new Error('Failed to validate business');
      }

      if (!business) {
        throw new Error('Business not found');
      }

      if (!business.is_active) {
        throw new Error('Business is not active');
      }

      console.log('QR Generator: Business validated successfully:', business.name);

      // Generate QR code with optimal settings
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setStatus('ready');
      console.log('QR Generator: QR code generated successfully');
      
    } catch (err) {
      console.error('QR generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setStatus('error');
      setError(errorMessage);
    }
  };

  // Generate QR when canvas is ready and business ID is available
  useEffect(() => {
    if (canvasReady && businessId) {
      validateAndGenerateQR();
    }
  }, [canvasReady, businessId]);

  const downloadQR = async () => {
    if (canvasRef.current && status === 'ready') {
      try {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-booking-qr-${timestamp}.png`;
        link.href = canvasRef.current.toDataURL('image/png', 1.0);
        link.click();
        toast.success('QR code downloaded successfully');
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download QR code');
      }
    } else {
      toast.error('QR code not ready for download');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied to clipboard');
      console.log('URL copied successfully:', bookingUrl);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy URL');
    }
  };

  const shareUrl = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: `Book ${businessName}`,
          text: `Book services with ${businessName}`,
          url: bookingUrl
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          console.log('Share successful');
        } else {
          throw new Error('Cannot share this content');
        }
      } else {
        // Fallback to copy
        await copyUrl();
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to copy on any share failure
      await copyUrl();
    }
  };

  const testBooking = () => {
    try {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening booking page...');
    } catch (error) {
      console.error('Test booking failed:', error);
      toast.error('Failed to open booking page');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-1"></div>
            Loading...
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Booking QR Code
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={validateAndGenerateQR}
              disabled={status === 'loading'}
              className="h-6 px-2"
            >
              <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {status === 'ready' ? (
            <div className="p-2 bg-white rounded-lg shadow-sm border">
              <canvas 
                ref={canvasRef} 
                className="block mx-auto rounded"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          ) : status === 'error' ? (
            <div className="w-[300px] h-[300px] border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center bg-red-50 p-4">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-red-600 text-center mb-3">{error}</p>
              <Button
                onClick={validateAndGenerateQR}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Generating QR code...</p>
              </div>
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
            className="w-full"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          
          <Button 
            onClick={copyUrl} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy URL
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={status !== 'ready'}
            className="w-full"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Test
          </Button>
        </div>

        {status === 'ready' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-green-900 text-sm">QR Code Ready</h5>
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Scan with any camera app or QR scanner</li>
              <li>• Links directly to your booking page</li>
              <li>• High error correction for reliability</li>
              <li>• Works offline once downloaded</li>
            </ul>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h5 className="font-medium text-red-900 text-sm">Generation Failed</h5>
            </div>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Ensure business is active and published</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if issue persists</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
