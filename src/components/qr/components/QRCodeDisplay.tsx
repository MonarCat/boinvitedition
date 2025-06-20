
import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { AlertCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  bookingUrl: string;
  validationStatus: 'pending' | 'valid' | 'invalid';
  isValidating: boolean;
  onQRGenerated: (canvas: HTMLCanvasElement) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  bookingUrl,
  validationStatus,
  isValidating,
  onQRGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (validationStatus === 'valid' && canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, bookingUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        onQRGenerated(canvasRef.current);
      }
    };

    generateQR();
  }, [bookingUrl, validationStatus, onQRGenerated]);

  if (validationStatus === 'valid') {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-green-200">
        <canvas 
          ref={canvasRef} 
          className="rounded max-w-full h-auto"
        />
      </div>
    );
  }

  return (
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
  );
};
