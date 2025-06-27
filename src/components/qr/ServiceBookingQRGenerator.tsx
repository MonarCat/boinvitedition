import React, { useRef, useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Share2, Copy, QrCode, AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceBookingQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const ServiceBookingQRGenerator: React.FC<ServiceBookingQRGeneratorProps> = ({ businessId, businessName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  const generateQR = useCallback(async () => {
    setStatus('loading');
    setError(null);
    if (!canvasRef.current) {
      setTimeout(generateQR, 50); // Retry if canvas is not ready
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        type: 'image/png',
      });
      setQrDataUrl(dataUrl);
      setStatus('ready');
    } catch (err) {
      console.error('QR generation failed:', err);
      setError('Failed to generate QR code. Please try again.');
      setStatus('error');
      toast.error('QR Generation Failed');
    }
  }, [bookingUrl]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${businessName}-booking-qr.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR Code downloaded.');
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body style="text-align: center; margin-top: 50px;">
          <h2>${businessName}</h2>
          <p>Scan to book</p>
          <img src="${qrDataUrl}" alt="Booking QR Code" />
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
  };

  const handleShare = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${businessName}-booking-qr.png`, { type: 'image/png' });
        await navigator.share({
          title: `Book a service with ${businessName}`,
          text: `Scan this QR code or use the link to book a service.`,
          files: [file],
          url: bookingUrl,
        });
      } catch (error) {
        console.error('Sharing failed:', error);
        toast.error('Could not share QR code.');
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Booking URL copied to clipboard.');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode /> Service Booking QR Code
        </CardTitle>
        <div className="flex items-center gap-2 pt-2">
          {status === 'ready' && <Badge variant="default" className="bg-green-500">Ready</Badge>}
          {status === 'loading' && <Badge variant="secondary">Loading...</Badge>}
          {status === 'error' && <Badge variant="destructive">Error</Badge>}
          <Button variant="ghost" size="icon" onClick={generateQR} disabled={status === 'loading'}>
            <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center w-[300px] h-[300px] mx-auto border rounded-lg bg-white">
          {status === 'ready' && qrDataUrl && (
            <img src={qrDataUrl} alt="Booking QR Code" />
          )}
          {status === 'loading' && <p>Generating...</p>}
          {status === 'error' && <div className="text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2" /><p>{error}</p></div>}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleDownload} disabled={status !== 'ready'}><Download className="w-4 h-4 mr-2" />Download</Button>
          <Button onClick={handlePrint} disabled={status !== 'ready'}><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Button onClick={handleShare} disabled={status !== 'ready'}><Share2 className="w-4 h-4 mr-2" />Share</Button>
          <Button onClick={handleCopy} disabled={status !== 'ready'}><Copy className="w-4 h-4 mr-2" />Copy URL</Button>
        </div>
        <Button asChild variant="outline">
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Booking Link
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
