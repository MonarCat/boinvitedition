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
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  const generateQR = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      if (!canvasRef.current) {
        throw new Error('Canvas not initialized');
      }

      // Validate business exists and is active
      const { data: business, error: supabaseError } = await supabase
        .from('businesses')
        .select('id, is_active')
        .eq('id', businessId)
        .eq('is_active', true)
        .single();

      if (supabaseError || !business) {
        throw new Error('Business not found or inactive');
      }

      // Generate QR code with high error correction
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
      toast.error('QR code generation failed');
    }
  };

  const downloadQR = () => {
    if (canvasRef.current && status === 'ready') {
      const link = document.createElement('a');
      link.download = `${businessName}-booking-qr.png`;
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
          text: `Scan to book services at ${businessName}`,
          url: bookingUrl
        });
      } else {
        await copyUrl();
      }
    } catch (err) {
      // Share cancelled
    }
  };

  useEffect(() => {
    generateQR();
  }, [businessId]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Booking QR Code
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {status === 'ready' ? (
            <canvas 
              ref={canvasRef} 
              className="border rounded-lg shadow-sm"
              style={{ width: '300px', height: '300px' }}
            />
          ) : status === 'error' ? (
            <div className="w-[300px] h-[300px] border rounded-lg flex flex-col items-center justify-center bg-red-50">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-red-600 text-center">{error}</p>
              <Button 
                onClick={generateQR}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="w-[300px] h-[300px] border rounded-lg flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            disabled={status !== 'ready'}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button 
            onClick={copyUrl} 
            variant="outline" 
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
          
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm"
            disabled={status !== 'ready'}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            onClick={() => window.open(bookingUrl, '_blank')} 
            variant="outline" 
            size="sm"
            disabled={status !== 'ready'}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};