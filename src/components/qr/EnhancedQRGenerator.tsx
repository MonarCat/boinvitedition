import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Copy, ExternalLink, Share2, AlertCircle, CheckCircle, RefreshCw, Link2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateBusinessSlug, isValidSlug } from '@/utils/businessSlug';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [businessSlug, setBusinessSlug] = useState('');
  
  // Generate clean URL using business slug
  const getBookingUrl = () => {
    const slug = businessSlug || generateBusinessSlug(businessName);
    return `https://boinvit.com/${slug}`;
  };
  
  const bookingUrl = getBookingUrl();
  console.log('QR Debug: Using clean URL:', bookingUrl);
  
  // Generate alternative booking methods
  const getAlternativeBookingMethods = () => {
    const baseUrl = bookingUrl;
    return {
      whatsapp: `https://wa.me/?text=Book%20services%20with%20${encodeURIComponent(businessName)}:%20${encodeURIComponent(baseUrl)}`,
      sms: `sms:?body=Book services with ${businessName}: ${baseUrl}`,
      email: `mailto:?subject=Book services with ${businessName}&body=You can book services here: ${baseUrl}`,
      direct: baseUrl
    };
  };

  const alternativeUrls = getAlternativeBookingMethods();
  
  // Comprehensive validation and QR generation
  useEffect(() => {
    const validateAndGenerateQR = async () => {
      if (!businessId) {
        setValidationStatus('invalid');
        toast.error('No business ID provided');
        return;
      }

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
          .select('id, name, is_active, user_id, description, phone, email, city, country')
          .eq('id', businessId)
          .single();

        if (businessError) {
          console.error('QR Error: Business validation failed:', businessError);
          setValidationStatus('invalid');
          toast.error('Business not found or inactive');
          return;
        }

        if (!business || !business.is_active) {
          console.error('QR Error: Business not found or inactive:', business);
          setValidationStatus('invalid');
          toast.error('Business not found or inactive');
          return;
        }

        console.log('QR Debug: Business validated:', business.name);
        setBusinessData(business);
        
        // Generate and set business slug
        const slug = generateBusinessSlug(business.name);
        setBusinessSlug(slug);
        console.log('QR Debug: Generated slug:', slug);

        // Check if business has active services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, name, is_active')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (servicesError) {
          console.error('QR Error: Services check failed:', servicesError);
        }

        const activeServices = services || [];
        setHasServices(activeServices.length > 0);
        console.log('QR Debug: Active services found:', activeServices.length);

        setValidationStatus('valid');

        // Generate high-quality QR code with the clean URL
        const finalUrl = `https://boinvit.com/${slug}`;
        console.log('QR Debug: Final booking URL:', finalUrl);
        
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, finalUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          console.log('QR Debug: QR code generated successfully for URL:', finalUrl);
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
  }, [businessId, businessName]);

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

  const shareViaWhatsApp = () => {
    window.open(alternativeUrls.whatsapp, '_blank');
  };

  const shareViaSMS = () => {
    window.location.href = alternativeUrls.sms;
  };

  const shareViaEmail = () => {
    window.location.href = alternativeUrls.email;
  };

  const testBooking = () => {
    if (validationStatus === 'valid') {
      console.log('QR Debug: Testing booking URL:', bookingUrl);
      window.open(bookingUrl, '_blank');
    } else {
      toast.error('Cannot test invalid booking URL');
    }
  };

  const refreshValidation = () => {
    setValidationStatus('pending');
    setIsValidating(true);
    console.log('QR Debug: Refreshing validation...');
    
    setTimeout(() => {
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
            .single();

          if (businessError || !business || !business.is_active) {
            setValidationStatus('invalid');
            toast.error('Business not found or inactive');
            return;
          }

          setBusinessData(business);
          const slug = generateBusinessSlug(business.name);
          setBusinessSlug(slug);
          setValidationStatus('valid');
          
          const finalUrl = `https://boinvit.com/${slug}`;
          if (canvasRef.current) {
            await QRCode.toCanvas(canvasRef.current, finalUrl, {
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
    }, 100);
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Booking System
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="md:hidden"
          >
            {isMinimized ? '▼' : '▲'}
          </Button>
        </div>
        
        {!isMinimized && (
          <>
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
              Clean URLs for {businessName}
            </p>
          </>
        )}
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="space-y-4">
          {/* Business Info Display */}
          {businessData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-900 mb-1 text-sm">Business Verified ✓</h5>
              <p className="text-xs text-blue-800">
                <strong>Name:</strong> {businessData.name}
              </p>
              <p className="text-xs text-blue-800">
                <strong>Clean URL:</strong> {businessSlug}.boinvit.com
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
            <p className="text-xs text-gray-500 mb-2">Clean Booking URL:</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all border">
              {bookingUrl}
            </div>
          </div>

          {/* Alternative Booking Methods */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Share Your Business:</h4>
            
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={shareViaWhatsApp} 
                variant="outline" 
                size="sm"
                disabled={validationStatus !== 'valid'}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
              
              <Button 
                onClick={shareViaSMS} 
                variant="outline" 
                size="sm"
                disabled={validationStatus !== 'valid'}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share via SMS
              </Button>
              
              <Button 
                onClick={shareViaEmail} 
                variant="outline" 
                size="sm"
                disabled={validationStatus !== 'valid'}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={copyUrl} 
              variant="default" 
              size="sm"
              disabled={validationStatus !== 'valid'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Clean URL
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={downloadQR} 
                variant="outline" 
                size="sm"
                disabled={validationStatus !== 'valid'}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
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
          </div>

          {/* Status Messages */}
          {validationStatus === 'valid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-medium text-green-900 mb-2 text-sm">✅ Clean URL Ready!</h5>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Business verified and active</li>
                <li>• Clean URL: {businessSlug}.boinvit.com</li>
                <li>• QR code points to clean URL</li>
                <li>• High error correction enabled</li>
                <li>• Mobile-optimized scanning</li>
                <li>• Multiple sharing options available</li>
                {hasServices && <li>• Services available for booking</li>}
                {!hasServices && <li>• ⚠️ No active services found</li>}
              </ul>
            </div>
          )}

          {validationStatus === 'invalid' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-medium text-red-900 mb-2 text-sm">❌ Setup Required</h5>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Business ID invalid or not found</li>
                <li>• Ensure business is active and published</li>
                <li>• Check if business has active services</li>
                <li>• Verify business registration is complete</li>
              </ul>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-gray-900 mb-2 text-sm">How Clients Can Book</h5>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Scan QR code with phone camera</li>
              <li>• Click shared WhatsApp/SMS links</li>
              <li>• Visit: boinvit.com/{businessSlug}</li>
              <li>• No app download required</li>
              <li>• Works on all devices</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
