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

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const EnhancedQRGenerator: React.FC<EnhancedQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [businessData, setBusinessData] = useState<any>(null);
  const [hasServices, setHasServices] = useState(false);
  
  // Generate the booking URL - use production domain when available
  const baseUrl = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('lovable.app') 
    ? 'https://boinvit.netlify.app' 
    : window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  // Comprehensive validation and QR generation
  useEffect(() => {
    const validateAndGenerateQR = async () => {
      if (!businessId) {
        setValidationStatus('invalid');
        toast.error('No business ID provided');
        return;
      }

      // Validate UUID format
      if (!isValidUUID(businessId)) {
        setValidationStatus('invalid');
        toast.error('Invalid business ID format');
        return;
      }

      setIsValidating(true);
      console.log('QR Debug: Starting validation for business:', businessId);
      
      try {
        // Validate business exists and is active
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id, name, is_active, user_id, description, phone, email')
          .eq('id', businessId)
          .eq('is_active', true)
          .single();

        if (businessError || !business) {
          console.error('QR Error: Business validation failed:', businessError);
          setValidationStatus('invalid');
          toast.error('Business not found or inactive');
          return;
        }

        console.log('QR Debug: Business validated:', business.name);
        setBusinessData(business);

        // Check if business has active services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, name, is_active')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (servicesError) {
          console.error('QR Error: Services check failed:', servicesError);
          toast.error('Error checking business services');
        }

        const activeServices = services || [];
        setHasServices(activeServices.length > 0);
        console.log('QR Debug: Active services found:', activeServices.length);

        setValidationStatus('valid');

        // Generate high-quality QR code
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, bookingUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H', // High error correction (30% damage tolerance)
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          console.log('QR Debug: QR code generated successfully');
        }

      } catch (error) {
        console.error('QR Error: Validation failed:', error);
        setValidationStatus('invalid');
        toast.error('Failed to validate business data');
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

  const refreshValidation = () => {
    setValidationStatus('pending');
    setIsValidating(true);
    // Trigger re-validation without page reload
    const validateAndGenerateQR = async () => {
      if (!businessId || !isValidUUID(businessId)) {
        setValidationStatus('invalid');
        setIsValidating(false);
        return;
      }

      try {
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id, name, is_active, user_id, description, phone, email')
          .eq('id', businessId)
          .eq('is_active', true)
          .single();

        if (businessError || !business) {
          setValidationStatus('invalid');
          toast.error('Business not found or inactive');
          return;
        }

        setBusinessData(business);
        setValidationStatus('valid');
        
        // Regenerate QR code
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
        
        toast.success('QR code refreshed successfully');
      } catch (error) {
        setValidationStatus('invalid');
        toast.error('Failed to refresh QR code');
      } finally {
        setIsValidating(false);
      }
    };
    
    validateAndGenerateQR();
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
          Enhanced QR Code System
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          {getStatusBadge()}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshValidation}
            className="h-6 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Validated booking system for {businessName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Business Info Display */}
        {businessData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 mb-1 text-sm">Business Verified</h5>
            <p className="text-xs text-blue-800">
              <strong>Name:</strong> {businessData.name}
            </p>
            {businessData.phone && (
              <p className="text-xs text-blue-800">
                <strong>Phone:</strong> {businessData.phone}
              </p>
            )}
            <p className="text-xs text-blue-800">
              <strong>Services Available:</strong> {hasServices ? 'Yes' : 'No services found'}
            </p>
          </div>
        )}

        {/* QR Code Display */}
        <div className="flex justify-center">
          {validationStatus === 'valid' ? (
            <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-green-200">
              <canvas 
                ref={canvasRef} 
                className="rounded max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="w-[300px] h-[300px] border rounded-lg flex items-center justify-center bg-gray-50">
              {isValidating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Validating business...</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Business validation failed</p>
                  <p className="text-xs text-red-500 mt-1">Check business status and try again</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* URL Display */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all border">
            {bookingUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button 
            onClick={shareUrl} 
            variant="default" 
            size="sm"
            disabled={validationStatus !== 'valid'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Booking Link
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={copyUrl} 
              variant="outline" 
              size="sm"
              disabled={validationStatus !== 'valid'}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
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
          </div>
          
          <Button 
            onClick={testBooking} 
            variant="outline" 
            size="sm"
            disabled={validationStatus !== 'valid'}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking Page
          </Button>
        </div>

        {/* Status Messages */}
        {validationStatus === 'valid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2 text-sm">✅ QR Code Ready!</h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Business verified and active</li>
              <li>• High error correction (30% damage tolerance)</li>
              <li>• Optimized for mobile camera scanning</li>
              <li>• Points to verified booking page</li>
              {hasServices && <li>• Services available for booking</li>}
              {!hasServices && <li>• ⚠️ No active services found</li>}
            </ul>
          </div>
        )}

        {validationStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="font-medium text-red-900 mb-2 text-sm">❌ QR Code Issues</h5>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• Business ID invalid or business not found</li>
              <li>• Ensure business is active and published</li>
              <li>• Check if business has active services</li>
              <li>• Contact support if problem persists</li>
            </ul>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h5 className="font-medium text-gray-900 mb-2 text-sm">How to Use</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Print QR code on business cards or posters</li>
            <li>• Share booking URL via WhatsApp or social media</li>
            <li>• Clients scan to access booking page directly</li>
            <li>• Works with any QR scanner or camera app</li>
            <li>• No app download required for clients</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
