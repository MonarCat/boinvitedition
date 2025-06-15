
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface BusinessQRGeneratorProps {
  businessId: string;
}

export const BusinessQRGenerator = ({ businessId }: BusinessQRGeneratorProps) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('Our Business');
  const printRef = useRef<HTMLDivElement>(null);

  const bookingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/public-booking/${businessId}`
      : `/public-booking/${businessId}`;

  // Fetch business name
  useEffect(() => {
    const fetchBusinessName = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single();
      if (data?.name) setBusinessName(data.name);
    };
    fetchBusinessName();
  }, [businessId]);

  // Generate QR code
  useEffect(() => {
    QRCode.toDataURL(bookingUrl, { width: 256, margin: 2 }, (err, url) => {
      if (!err && url) setQrUrl(url);
    });
  }, [bookingUrl]);

  // Print handler
  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const w = window.open('', '', 'width=400,height=600');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fafafa; }
              .qr-print-container { 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                min-height: 100vh; padding: 24px;
              }
              .qr-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 12px; color: #1a202c; }
              .qr-business { font-size: 1.1rem; margin-bottom: 12px; color: #566174; }
              .qr-code-img { margin: 24px 0; }
              .qr-instruction { font-size: 1rem; color: #374151; margin-top: 16px; }
              @media print { body { zoom: 1.12; } }
            </style>
          </head>
          <body>
            <div class="qr-print-container">
              ${content}
            </div>
          </body>
        </html>
      `);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
        w.close();
      }, 100);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={printRef}>
        <div className="qr-title text-xl font-bold text-gray-900 mb-1 text-center">
          Walk-In & Direct Booking
        </div>
        <div className="qr-business text-base font-medium text-blue-600 mb-2 text-center truncate max-w-xs">
          {businessName}
        </div>
        {qrUrl && (
          <img
            src={qrUrl}
            alt={`QR code for ${bookingUrl}`}
            className="qr-code-img mx-auto rounded-lg border border-gray-300 shadow-lg bg-white p-2"
            style={{ width: 224, height: 224 }}
            width={224}
            height={224}
          />
        )}
        <div className="qr-instruction text-center text-gray-700 mt-3">
          <span className="block font-medium">Scan this QR code to book directly on our services page.</span>
          <span className="block text-xs text-gray-400 mt-1">{bookingUrl}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="mt-4 flex items-center gap-2"
        aria-label="Print QR Code Poster"
      >
        <Printer className="w-4 h-4 mr-1" />
        Print QR Code for Display
      </Button>
    </div>
  );
};
