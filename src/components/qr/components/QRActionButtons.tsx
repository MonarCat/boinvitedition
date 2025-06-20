
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, ExternalLink } from 'lucide-react';
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

  const shareUrl = async () => {
    if (validationStatus !== 'valid') {
      toast.error('Cannot share invalid booking URL');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book ${businessName}`,
          text: `Book services with ${businessName}`,
          url: bookingUrl,
        });
      } catch (error) {
        // User cancelled sharing or share failed
      }
    } else {
      copyUrl();
    }
  };

  const testBooking = () => {
    if (validationStatus === 'valid') {
      window.open(bookingUrl, '_blank');
    } else {
      toast.error('Cannot test invalid booking URL');
    }
  };

  const isDisabled = validationStatus !== 'valid';

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button 
        onClick={shareUrl} 
        variant="default" 
        size="sm"
        disabled={isDisabled}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Booking Link
      </Button>
      
      <Button 
        onClick={copyUrl} 
        variant="outline" 
        size="sm"
        disabled={isDisabled}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Link
      </Button>
      
      <Button 
        onClick={downloadQR} 
        variant="outline" 
        size="sm"
        disabled={isDisabled}
      >
        <Download className="w-4 h-4 mr-2" />
        Download QR Code
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
  );
};
