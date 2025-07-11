
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
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
  const templateRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;

  // Updated template styles with semi-transparent backgrounds for better readability
  const templateStyles = {
    pink: {
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(190, 24, 93, 0.4) 50%, rgba(131, 24, 67, 0.3) 100%)',
      qrFrame: '#3b82f6',
      textColor: '#000000',
      accentColor: '#dc2626'
    },
    yellow: {
      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(161, 98, 7, 0.3) 100%)',
      qrFrame: '#eab308',
      textColor: '#000000',
      accentColor: '#f59e0b'
    },
    blue: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(29, 78, 216, 0.4) 50%, rgba(30, 64, 175, 0.3) 100%)',
      qrFrame: '#ef4444',
      textColor: '#000000',
      accentColor: '#ef4444'
    },
    red: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.4) 50%, rgba(185, 28, 28, 0.3) 100%)',
      qrFrame: '#ef4444',
      textColor: '#000000',
      accentColor: '#ef4444'
    },
    neutral: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.3) 0%, rgba(75, 85, 99, 0.4) 50%, rgba(55, 65, 81, 0.3) 100%)',
      qrFrame: '#000000',
      textColor: '#000000',
      accentColor: '#6b7280'
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
        width: 200,
        margin: 1,
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
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `qr-template-${templateStyle}.png`;
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
          <title>QR Code Template</title>
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

  // Reduced opacity geometric shapes for better text readability
  const renderGeometricBackground = () => {
    const shapes = [];
    for (let i = 0; i < 6; i++) {
      shapes.push(
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
            opacity: 0.1,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    }
    return shapes;
  };

  return (
    <div className="space-y-4">
      {/* Template Preview with improved readability */}
      <div 
        ref={templateRef}
        className="relative w-[384px] h-[512px] mx-auto shadow-2xl rounded-2xl overflow-hidden"
        style={{ 
          background: currentStyle.background,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Subtle Geometric Background Elements */}
        <div className="absolute inset-0">
          {renderGeometricBackground()}
        </div>

        {/* Clear overlay for better text readability */}
        <div className="absolute inset-0 bg-white bg-opacity-10"></div>

        {/* Main Content */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          {/* Business Name Field - Blank with dashed border for handwriting */}
          <div className="border-2 border-dashed border-black rounded-lg p-4 bg-white bg-opacity-80">
            <div className="text-center text-gray-500 text-sm font-medium tracking-wider opacity-70">
              BUSINESS NAME
            </div>
            <div className="h-8 mt-2"></div>
          </div>

          {/* Main Title with better contrast */}
          <div className="text-center flex-1 flex flex-col justify-center bg-white bg-opacity-20 rounded-2xl p-6">
            <h1 
              className="text-5xl font-black mb-4 drop-shadow-sm"
              style={{ color: currentStyle.textColor }}
            >
              Scan HERE
            </h1>

            {/* Subtitle with enhanced readability */}
            <p 
              className="text-xl font-medium mb-8 drop-shadow-sm"
              style={{ 
                color: templateStyle === 'pink' || templateStyle === 'red' ? currentStyle.accentColor : '#8B4513'
              }}
            >
              Book & Pay Easy
            </p>

            {/* QR Code Area with Frame */}
            <div className="flex justify-center mb-8">
              <div 
                className="relative bg-white rounded-3xl p-4 shadow-inner"
                style={{ 
                  border: `6px solid ${currentStyle.qrFrame}`,
                  borderRadius: '24px'
                }}
              >
                {/* QR Code Frame Corners */}
                <div 
                  className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 rounded-tl-lg"
                  style={{ borderColor: currentStyle.qrFrame }}
                />
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 rounded-tr-lg"
                  style={{ borderColor: currentStyle.qrFrame }}
                />
                <div 
                  className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 rounded-bl-lg"
                  style={{ borderColor: currentStyle.qrFrame }}
                />
                <div 
                  className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 rounded-br-lg"
                  style={{ borderColor: currentStyle.qrFrame }}
                />

                {/* QR Code or Placeholder */}
                <div className="w-32 h-32 flex items-center justify-center">
                  {qrDataUrl && !isGenerating ? (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">QR CODE</div>
                      {isGenerating && <div className="text-xs text-gray-600">Loading...</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Boinvit Branding with better contrast */}
          <div 
            className="text-center px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: 'white'
            }}
          >
            <div className="text-sm font-medium">
              Powered By{' '}
              <span className="font-bold">
                B<span style={{ color: currentStyle.accentColor }}>oi</span>nvit
              </span>
            </div>
            <div className="text-xs opacity-90 mt-1">
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
