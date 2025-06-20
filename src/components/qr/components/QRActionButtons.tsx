
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QRActionButtonsProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
  bookingUrl: string;
  businessName: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const QRActionButtons: React.FC<QRActionButtonsProps> = ({
  validationStatus,
  bookingUrl,
  businessName,
  canvasRef
}) => {
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

  const testBooking = () => {
    if (validationStatus === 'valid') {
      console.log('QR Debug: Testing booking URL:', bookingUrl);
      window.open(bookingUrl, '_blank');
    } else {
      toast.error('Cannot test invalid booking URL');
    }
  };

  const isDisabled = validationStatus !== 'valid';

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button 
        onClick={copyUrl} 
        variant="default" 
        size="sm"
        disabled={isDisabled}
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
          disabled={isDisabled}
        >
          <Download className="w-4 h-4 mr-2" />
          Download QR
        </Button>
        
        <Button 
          onClick={testBooking} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Test Booking
        </Button>
      </div>
    </div>
  );
};
