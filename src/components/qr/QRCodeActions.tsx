
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeActionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  businessName: string;
  bookingUrl: string;
  validationStatus: 'pending' | 'valid' | 'invalid';
  qrGenerated: boolean;
}

export const QRCodeActions: React.FC<QRCodeActionsProps> = ({
  canvasRef,
  businessName,
  bookingUrl,
  validationStatus,
  qrGenerated
}) => {
  const downloadQR = () => {
    if (canvasRef.current && validationStatus === 'valid' && qrGenerated) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName}-booking-qr-${timestamp}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      toast.success('QR code downloaded successfully');
    } else {
      toast.error('QR code not ready for download');
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
        copyUrl();
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

  const isActionDisabled = validationStatus !== 'valid';

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button 
        onClick={shareUrl} 
        variant="default" 
        size="sm"
        disabled={isActionDisabled}
        className="w-full"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Booking Link
      </Button>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={copyUrl} 
          variant="outline" 
          size="sm"
          disabled={isActionDisabled}
        >
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </Button>
        
        <Button 
          onClick={downloadQR} 
          variant="outline" 
          size="sm"
          disabled={isActionDisabled || !qrGenerated}
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
        
        <Button 
          onClick={testBooking} 
          variant="outline" 
          size="sm"
          disabled={isActionDisabled}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Test
        </Button>
      </div>
    </div>
  );
};
