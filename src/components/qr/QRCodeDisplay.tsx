
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, AlertCircle, RefreshCw } from 'lucide-react';

interface QRCodeDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  qrGenerated: boolean;
  validationStatus: 'pending' | 'valid' | 'invalid';
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  canvasRef,
  qrGenerated,
  validationStatus,
  isGenerating,
  onRegenerate
}) => {
  if (validationStatus === 'valid' && qrGenerated) {
    return (
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-100">
          <canvas 
            ref={canvasRef} 
            className="block mx-auto rounded"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
        {isGenerating ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Generating QR code...</p>
          </div>
        ) : validationStatus === 'invalid' ? (
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-2">QR code generation failed</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">QR code will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
