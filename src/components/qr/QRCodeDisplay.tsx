
import React from 'react';
import { QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  qrGenerated: boolean;
  isGenerating?: boolean;
  onRegenerate?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  canvasRef,
  qrGenerated,
  isGenerating = false,
  onRegenerate
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-blue-600">
        {qrGenerated ? (
          <canvas 
            ref={canvasRef} 
            className="block mx-auto max-w-full h-auto"
          />
        ) : (
          <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Generating QR Code...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                </>
              ) : (
                <>
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-3">QR Code will appear here</p>
                  {onRegenerate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRegenerate}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Generate QR Code
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
