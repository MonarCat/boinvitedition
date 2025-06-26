
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { QRCodeDisplay } from './QRCodeDisplay';
import { QRCodeActions } from './QRCodeActions';
import { QRCodeStatus } from './QRCodeStatus';
import { QRCodeValidator } from './QRCodeValidator';

interface QRCodeGeneratorProps {
  businessId: string;
  businessName: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  businessId,
  businessName,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate booking URL
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  const generateQRCode = async (url: string) => {
    if (!canvasRef.current) return false;

    setIsGenerating(true);
    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('QR code generated successfully for:', url);
      return true;
    } catch (error) {
      console.error('QR code generation failed:', error);
      toast.error('Failed to generate QR code');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidationResult = async (isValid: boolean) => {
    setValidationStatus(isValid ? 'valid' : 'invalid');
    
    if (isValid) {
      const success = await generateQRCode(bookingUrl);
      setQrGenerated(success);
      if (success) {
        toast.success('QR code generated successfully');
      }
    } else {
      setQrGenerated(false);
    }
  };

  const regenerateQR = async () => {
    setQrGenerated(false);
    setValidationStatus('pending');
    // Trigger re-validation which will regenerate if valid
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <QRCodeValidator
        businessId={businessId}
        onValidationResult={handleValidationResult}
        isValidating={isValidating}
        setIsValidating={setIsValidating}
      />
      
      <QRCodeStatus
        validationStatus={validationStatus}
        isValidating={isValidating}
        isGenerating={isGenerating}
        onRegenerate={regenerateQR}
      />
      
      <QRCodeDisplay
        canvasRef={canvasRef}
        qrGenerated={qrGenerated}
        validationStatus={validationStatus}
        isGenerating={isGenerating}
        onRegenerate={regenerateQR}
      />
      
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Booking URL:</p>
        <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
          {bookingUrl}
        </div>
      </div>
      
      <QRCodeActions
        canvasRef={canvasRef}
        businessName={businessName}
        bookingUrl={bookingUrl}
        validationStatus={validationStatus}
        qrGenerated={qrGenerated}
      />
    </div>
  );
};
