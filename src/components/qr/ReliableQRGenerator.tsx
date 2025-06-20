
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { validateBusiness } from './utils/qrValidation';
import { QRCodeCanvas } from './components/QRCodeCanvas';
import { QRStatusBadge } from './components/QRStatusBadge';
import { QRActionButtons } from './components/QRActionButtons';
import { QRStatusMessages } from './components/QRStatusMessages';

interface ReliableQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const ReliableQRGenerator: React.FC<ReliableQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  
  // Generate reliable booking URL
  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${businessId}`;
  
  // Validate business ID and generate QR code
  useEffect(() => {
    const validateAndGenerateQR = async () => {
      if (!businessId) {
        setValidationStatus('invalid');
        return;
      }

      setIsValidating(true);
      
      try {
        await validateBusiness(businessId);
        setValidationStatus('valid');
      } catch (error) {
        console.error('QR validation error:', error);
        setValidationStatus('invalid');
        toast.error(error instanceof Error ? error.message : 'Failed to validate business');
      } finally {
        setIsValidating(false);
      }
    };

    validateAndGenerateQR();
  }, [businessId]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Client Booking QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <QRStatusBadge 
            validationStatus={validationStatus} 
            isValidating={isValidating} 
          />
        </div>
        <p className="text-sm text-gray-600">
          Reliable QR code for client bookings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCodeCanvas 
            bookingUrl={bookingUrl}
            validationStatus={validationStatus}
            isValidating={isValidating}
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
            {bookingUrl}
          </div>
        </div>

        <QRActionButtons 
          validationStatus={validationStatus}
          bookingUrl={bookingUrl}
          businessName={businessName}
          canvasRef={canvasRef}
        />

        <QRStatusMessages validationStatus={validationStatus} />
      </CardContent>
    </Card>
  );
};
