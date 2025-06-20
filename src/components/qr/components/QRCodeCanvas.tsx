
import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { AlertCircle } from 'lucide-react';

interface QRCodeCanvasProps {
  bookingUrl: string;
  validationStatus: 'pending' | 'valid' | 'invalid';
  isValidating: boolean;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  bookingUrl,
  validationStatus,
  isValidating
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (validationStatus === 'valid' && canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, bookingUrl, {
          width: 500,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    };

    generateQR();
  }, [bookingUrl, validationStatus]);

  if (validationStatus === 'valid') {
    return (
      <canvas 
        ref={canvasRef} 
        className="border rounded-lg shadow-sm max-w-full h-auto"
        style={{ maxWidth: '300px' }}
      />
    );
  }

  return (
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
  );
};
