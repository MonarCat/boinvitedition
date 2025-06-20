
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateBusinessSlug, isValidSlug } from '@/utils/businessSlug';
import { QRStatusBadge } from './components/QRStatusBadge';
import { QRBusinessInfo } from './components/QRBusinessInfo';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { QRActionButtons } from './components/QRActionButtons';
import { QRSharingMethods } from './components/QRSharingMethods';
import { QRStatusMessages } from './components/QRStatusMessages';
import { QRUsageInstructions } from './components/QRUsageInstructions';

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
  
  const getBookingUrl = () => {
    const slug = businessSlug || generateBusinessSlug(businessName);
    return `https://boinvit.com/${slug}`;
  };
  
  const bookingUrl = getBookingUrl();
  
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
      
      const slug = generateBusinessSlug(business.name);
      setBusinessSlug(slug);
      console.log('QR Debug: Generated slug:', slug);

      if (!isValidSlug(slug)) {
        console.error('QR Error: Invalid slug generated:', slug);
        setValidationStatus('invalid');
        toast.error('Invalid business name for URL generation');
        return;
      }

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
      toast.success('QR code generated successfully!');

    } catch (error) {
      console.error('QR Error: Validation failed:', error);
      setValidationStatus('invalid');
      toast.error('Failed to validate business data');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateAndGenerateQR();
  }, [businessId, businessName]);

  const refreshValidation = () => {
    setValidationStatus('pending');
    setIsValidating(true);
    console.log('QR Debug: Refreshing validation...');
    setTimeout(() => {
      validateAndGenerateQR();
    }, 100);
  };

  const handleQRGenerated = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Booking System
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
              <QRStatusBadge 
                validationStatus={validationStatus}
                isValidating={isValidating}
              />
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
              Clean URLs: {businessSlug}.boinvit.com
            </p>
          </>
        )}
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="space-y-4">
          <QRBusinessInfo 
            businessData={businessData}
            businessSlug={businessSlug}
            hasServices={hasServices}
          />

          <div className="flex justify-center">
            <QRCodeDisplay
              bookingUrl={bookingUrl}
              validationStatus={validationStatus}
              isValidating={isValidating}
              onQRGenerated={handleQRGenerated}
            />
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Clean Booking URL:</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all border">
              {bookingUrl}
            </div>
          </div>

          <QRActionButtons
            validationStatus={validationStatus}
            bookingUrl={bookingUrl}
            businessName={businessName}
            canvasRef={canvasRef}
          />

          <QRSharingMethods
            validationStatus={validationStatus}
            businessName={businessName}
            bookingUrl={bookingUrl}
          />

          <QRStatusMessages
            validationStatus={validationStatus}
            businessSlug={businessSlug}
            hasServices={hasServices}
          />

          <QRUsageInstructions businessSlug={businessSlug} />
        </CardContent>
      )}
    </Card>
  );
};
