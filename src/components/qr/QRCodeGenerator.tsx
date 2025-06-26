
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeGeneratorProps {
  businessId: string;
  businessName: string;
  showTitle?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  businessId,
  businessName,
  showTitle = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  const generateQR = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      if (!businessId) {
        throw new Error('No business ID provided');
      }

      // Wait for canvas to be ready
      let retries = 0;
      while (!canvasRef.current && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!canvasRef.current) {
        throw new Error('Canvas element not available');
      }

      // Validate business exists
      const { data: business, error: supabaseError } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();

      if (supabaseError) {
        throw new Error('Failed to validate business');
      }

      if (!business) {
        throw new Error('Business not found or inactive');
      }

      // Generate QR code
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
    } catch (err) {
      console.error('QR generation failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (canvasRef.current && status === 'ready') {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-qr-${timestamp}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking URL copied');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const shareUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Book ${businessName}`,
          text: `Book services with ${businessName}`,
          url: bookingUrl
        });
      } else {
        await copyUrl();
      }
    } catch (err) {
      // Share cancelled or failed, fallback to copy
      await copyUrl();
    }
  };

  const testBooking = () => {
    window.open(bookingUrl, '_blank');
  };

  useEffect(() => {
    if (businessId) {
      const timer = setTimeout(() => {
        generateQR();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [businessId]);

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
              onClick={generateQR}
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
                className="block mx-auto rounded max-w-full h-auto"
              />
            </div>
          ) : status === 'error' ? (
            <div className="w-[300px] h-[300px] border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center bg-red-50 p-4">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-red-600 text-center mb-3">{error}</p>
              <Button
                onClick={generateQR}
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
              <li>• Scan with any camera app</li>
              <li>• Links to your booking page</li>
              <li>• High error correction</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
