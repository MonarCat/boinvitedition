
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw, Eye, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedQRCodeGeneratorProps {
  businessId: string;
  businessName: string;
  showTitle?: boolean;
  showAnalytics?: boolean;
  customColors?: {
    dark: string;
    light: string;
  };
  logoUrl?: string;
  size?: number;
}

export const EnhancedQRCodeGenerator: React.FC<EnhancedQRCodeGeneratorProps> = ({
  businessId,
  businessName,
  showTitle = true,
  showAnalytics = false,
  customColors = { dark: '#000000', light: '#FFFFFF' },
  logoUrl,
  size = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  
  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  const validateBusiness = async (): Promise<boolean> => {
    if (!businessId) return false;
    
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Business validation error:', error);
        return false;
      }

      return !!business;
    } catch (error) {
      console.error('Business validation failed:', error);
      return false;
    }
  };

  const generateQRCode = async (): Promise<boolean> => {
    if (!canvasRef.current) return false;

    try {
      setIsGenerating(true);
      
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: customColors
      });
      
      // Add logo overlay if provided
      if (logoUrl) {
        await addLogoOverlay();
      }
      
      setQrGenerated(true);
      return true;
    } catch (error) {
      console.error('QR generation failed:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const addLogoOverlay = async () => {
    if (!canvasRef.current || !logoUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => {
          const logoSize = canvas.width * 0.15;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          
          // Draw white background circle
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          resolve();
        };
        logo.onerror = reject;
        logo.src = logoUrl;
      });
    } catch (error) {
      console.error('Logo overlay failed:', error);
    }
  };

  const validateAndGenerate = async () => {
    if (!businessId) {
      setValidationStatus('invalid');
      return;
    }

    setValidationStatus('pending');
    
    const isValid = await validateBusiness();
    
    if (isValid) {
      const success = await generateQRCode();
      if (success) {
        setValidationStatus('valid');
        toast.success('QR code generated successfully');
      } else {
        setValidationStatus('invalid');
        toast.error('Failed to generate QR code');
      }
    } else {
      setValidationStatus('invalid');
      toast.error('Business not found or inactive');
    }
  };

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
        // User cancelled sharing
        copyUrl();
      }
    } else {
      copyUrl();
    }
  };

  const testBooking = () => {
    if (validationStatus === 'valid') {
      setScanCount(prev => prev + 1);
      window.open(bookingUrl, '_blank');
    }
  };

  const getStatusBadge = () => {
    if (isGenerating) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          Generating...
        </Badge>
      );
    }
    
    switch (validationStatus) {
      case 'valid':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
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
        return (
          <Badge variant="secondary">
            Pending
          </Badge>
        );
    }
  };

  useEffect(() => {
    if (businessId) {
      validateAndGenerate();
    }
  }, [businessId, customColors.dark, customColors.light]);

  return (
    <Card className="w-full max-w-md mx-auto">
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Enhanced QR Code
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            {getStatusBadge()}
          </div>
          {showAnalytics && scanCount > 0 && (
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Eye className="w-3 h-3" />
              {scanCount} scans
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {validationStatus === 'valid' && qrGenerated && !isGenerating ? (
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                className="border rounded-lg shadow-sm max-w-full h-auto"
              />
              {logoUrl && (
                <Badge 
                  variant="secondary" 
                  className="absolute -bottom-2 -right-2 text-xs"
                >
                  Branded
                </Badge>
              )}
            </div>
          ) : (
            <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
              {isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Generating...</p>
                </div>
              ) : validationStatus === 'invalid' ? (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-2">Generation failed</p>
                  <Button variant="outline" size="sm" onClick={validateAndGenerate}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR code will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Permanent Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
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

        {showAnalytics && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            disabled={validationStatus !== 'valid'}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        )}

        {validationStatus === 'valid' && qrGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2 text-sm">QR Code Features:</h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Permanent booking link that never expires</li>
              <li>• High error correction for reliable scanning</li>
              <li>• Works with all mobile camera apps</li>
              <li>• Optimized for print and digital display</li>
              {logoUrl && <li>• Custom branded with your logo</li>}
              {showAnalytics && <li>• Scan tracking and analytics</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
