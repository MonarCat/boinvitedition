
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Scan, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductionQRScannerProps {
  onScanSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const ProductionQRScanner: React.FC<ProductionQRScannerProps> = ({
  onScanSuccess,
  onError
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await Navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      startQRDetection();
      
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setError('Camera access denied. Please allow camera permission and try again.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const detectQR = () => {
      if (!videoRef.current || !context || !isScanning) return;

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple QR code detection (in production, you'd use a proper QR library)
        // For now, we'll simulate QR detection with a manual input fallback
        
        // Continue scanning
        if (isScanning) {
          requestAnimationFrame(detectQR);
        }
      } catch (err) {
        console.error('QR detection error:', err);
      }
    };

    // Start detection loop
    requestAnimationFrame(detectQR);
  }, [isScanning]);

  const handleManualInput = () => {
    const url = prompt('Enter the booking URL or QR code data:');
    if (url) {
      handleQRDetected(url);
    }
  };

  const handleQRDetected = (url: string) => {
    try {
      // Validate URL
      let validUrl = url;
      
      // Check if it's a Boinvit booking URL
      if (url.includes('/book/') || url.includes('boinvit.com')) {
        validUrl = url;
      } else if (url.startsWith('http')) {
        validUrl = url;
      } else {
        // Assume it's a booking ID
        validUrl = `${window.location.origin}/book/${url}`;
      }

      setScannedUrl(validUrl);
      setError(null);
      stopCamera();
      
      toast.success('QR Code scanned successfully!');
      onScanSuccess?.(validUrl);
      
    } catch (err) {
      const errorMsg = 'Invalid QR code format';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const openBookingPage = () => {
    if (scannedUrl) {
      window.open(scannedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const resetScanner = () => {
    setScannedUrl(null);
    setError(null);
    stopCamera();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="w-5 h-5" />
          QR Code Scanner
        </CardTitle>
        <p className="text-sm text-gray-600">
          Scan a QR code to book services
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {scannedUrl ? (
          // Success State
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">QR Code Scanned!</h3>
              <p className="text-sm text-gray-600 mb-4">Ready to open booking page</p>
              <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono break-all">
                {scannedUrl}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={openBookingPage} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Booking
              </Button>
              <Button onClick={resetScanner} variant="outline">
                Scan Again
              </Button>
            </div>
          </div>
        ) : isScanning ? (
          // Scanning State
          <div className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Scan className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Position QR code in frame</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
              <Button onClick={handleManualInput} variant="ghost" className="flex-1">
                Enter Manually
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              <p>Make sure the QR code is clearly visible and well-lit</p>
            </div>
          </div>
        ) : (
          // Initial State
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-600">
                Point your camera at a QR code to book services
              </p>
            </div>
            
            {hasPermission === false && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Camera permission is required to scan QR codes. Please allow camera access and try again.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button onClick={startCamera} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              <Button onClick={handleManualInput} variant="outline" className="flex-1">
                Enter Manually
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              <p>Scan QR codes from business cards, flyers, or websites</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
