
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, QrCode, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrintableQRCodeProps {
  businessId: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
}

export const PrintableQRCode: React.FC<PrintableQRCodeProps> = ({
  businessId,
  businessName,
  businessAddress,
  businessPhone
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  
  const bookingUrl = `${window.location.origin}/book/${businessId}`;
  
  useEffect(() => {
    if (canvasRef.current && businessId) {
      QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
          toast.error('Failed to generate QR code');
        } else {
          setQrGenerated(true);
        }
      });
    }
  }, [bookingUrl, businessId]);

  const handlePrint = () => {
    if (!qrGenerated) {
      toast.error('QR code is still loading');
      return;
    }
    window.print();
  };

  const handleDownload = () => {
    if (canvasRef.current && qrGenerated) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${businessName}-booking-qr-${timestamp}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      toast.success('QR code downloaded successfully');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book ${businessName}`,
          text: `Scan to book services with ${businessName}`,
          url: bookingUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(bookingUrl);
        toast.success('Booking URL copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy URL');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handlePrint} disabled={!qrGenerated}>
              <Printer className="w-4 h-4 mr-2" />
              Print QR Code
            </Button>
            <Button onClick={handleDownload} variant="outline" disabled={!qrGenerated}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Printable QR Code Layout */}
      <div 
        ref={printRef}
        className="print-container bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto"
        style={{
          pageBreakInside: 'avoid',
          minHeight: '297mm', // A4 height
          maxWidth: '210mm'   // A4 width
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {businessName}
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-2">
            📱 BOOK HERE
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Scan QR Code to Book Your Service
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-blue-600">
            {qrGenerated ? (
              <canvas 
                ref={canvasRef} 
                className="block mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100 rounded">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Generating QR Code...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="text-center mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">
              📋 How to Book:
            </h3>
            <div className="text-left space-y-2 text-blue-800 max-w-md mx-auto">
              <p>1. 📱 Open your camera app</p>
              <p>2. 🎯 Point at the QR code</p>
              <p>3. 👆 Tap the notification</p>
              <p>4. ✅ Select your service & book!</p>
            </div>
          </div>
        </div>

        {/* Business Contact Info */}
        {(businessAddress || businessPhone) && (
          <div className="text-center mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
              {businessAddress && (
                <p className="text-gray-700 mb-1">📍 {businessAddress}</p>
              )}
              {businessPhone && (
                <p className="text-gray-700">📞 {businessPhone}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Messages */}
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              🎉 WELCOME!
            </h3>
            <p className="text-green-700">
              We're excited to serve you with excellent service
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-2xl font-bold text-yellow-700 mb-2">
              🙏 THANK YOU
            </h3>
            <p className="text-yellow-700">
              For choosing {businessName} - Your satisfaction is our priority
            </p>
          </div>
        </div>

        {/* URL for manual entry */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Can't scan? Visit this link:
          </p>
          <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
            {bookingUrl}
          </p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          @page {
            margin: 0.5in;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
};
