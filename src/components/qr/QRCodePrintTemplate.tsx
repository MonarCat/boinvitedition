
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodePrintTemplateProps {
  businessId: string;
  businessName: string;
  templateStyle?: 'pink' | 'yellow' | 'blue' | 'red' | 'neutral';
  onDownload?: () => void;
  onPrint?: () => void;
}

export const QRCodePrintTemplate: React.FC<QRCodePrintTemplateProps> = ({
  businessId,
  businessName,
  templateStyle = 'blue',
  onDownload,
  onPrint
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  // Template style configurations
  const templateStyles = {
    pink: {
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #831843 100%)',
      qrFrame: '#3b82f6',
      accent: '#ec4899'
    },
    yellow: {
      background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
      qrFrame: '#eab308',
      accent: '#f59e0b'
    },
    blue: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
      qrFrame: '#ef4444',
      accent: '#3b82f6'
    },
    red: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      qrFrame: '#ef4444',
      accent: '#ef4444'
    },
    neutral: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
      qrFrame: '#000000',
      accent: '#6b7280'
    }
  };

  const currentStyle = templateStyles[templateStyle];

  useEffect(() => {
    generateQR();
  }, [bookingUrl, businessId]);

  const generateQR = async () => {
    if (!businessId) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!templateRef.current) return;
    
    try {
      // Use html2canvas to capture the template
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `${businessName}-qr-template.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Template downloaded successfully');
      onDownload?.();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handlePrint = () => {
    if (!templateRef.current) return;
    
    const printWindow = window.open('', '_blank');
    const templateHtml = templateRef.current.outerHTML;
    
    printWindow?.document.write(`
      <html>
        <head>
          <title>QR Code Template - ${businessName}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${templateHtml}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
    
    onPrint?.();
  };

  return (
    <div className="space-y-4">
      {/* Template Preview */}
      <div 
        ref={templateRef}
        className="relative w-96 h-[28rem] mx-auto shadow-2xl rounded-lg overflow-hidden"
        style={{ background: currentStyle.background }}
      >
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
          <div 
            className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Business Name Field */}
          <div className="border-2 border-dashed border-gray-800 rounded-lg p-3 mb-6">
            <div className="text-center text-gray-500 text-sm font-medium">
              {businessName || 'BUSINESS NAME'}
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Scan HERE
            </h1>
            <p className="text-lg text-gray-800 font-medium italic">
              Book & Pay Easy
            </p>
          </div>

          {/* QR Code Area */}
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative w-48 h-48 bg-white rounded-2xl shadow-inner flex items-center justify-center"
              style={{ 
                border: `8px solid ${currentStyle.qrFrame}`,
                borderRadius: '24px'
              }}
            >
              {/* QR Code Frame Corners */}
              <div 
                className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg"
                style={{ borderColor: currentStyle.qrFrame }}
              />
              <div 
                className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg"
                style={{ borderColor: currentStyle.qrFrame }}
              />
              <div 
                className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg"
                style={{ borderColor: currentStyle.qrFrame }}
              />
              <div 
                className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 rounded-br-lg"
                style={{ borderColor: currentStyle.qrFrame }}
              />

              {/* QR Code or Placeholder */}
              {qrDataUrl && !isGenerating ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code" 
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">QR CODE</div>
                  {isGenerating && <div className="text-xs text-gray-600">Generating...</div>}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <div className="text-lg font-medium" style={{ color: currentStyle.accent }}>
              Powered By{' '}
              <span className="font-bold text-gray-900">
                B<span style={{ color: currentStyle.accent }}>oi</span>nvit
              </span>
            </div>
            <div className="text-sm text-gray-700 italic mt-1">
              Smart People Book Ahead.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button 
          onClick={handleDownload} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </Button>
        <Button 
          onClick={handlePrint} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Template
        </Button>
      </div>
    </div>
  );
};
