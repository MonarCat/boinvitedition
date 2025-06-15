
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export const BusinessQRGenerator = () => {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [customSlug, setCustomSlug] = useState<string>('');

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, subdomain')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const generateQRCode = async () => {
    if (!business) return;

    try {
      // Use the business ID as fallback if no custom slug
      const slug = customSlug || business.id;
      
      // Create the booking URL - always use the business ID as it's guaranteed to exist
      const bookingUrl = `${window.location.origin}/public-booking/${business.id}`;
      
      console.log('Generating QR code for URL:', bookingUrl);
      
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${business?.name || 'business'}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const testBookingUrl = () => {
    if (!business) return;
    
    const bookingUrl = `${window.location.origin}/public-booking/${business.id}`;
    window.open(bookingUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="custom-slug">Custom Slug (Optional)</Label>
          <Input
            id="custom-slug"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder={`Leave empty to use business ID: ${business?.id?.slice(0, 8)}...`}
          />
          <p className="text-sm text-gray-600 mt-1">
            Current booking URL: {window.location.origin}/public-booking/{customSlug || business?.id}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateQRCode} disabled={!business}>
            Generate QR Code
          </Button>
          <Button variant="outline" onClick={testBookingUrl} disabled={!business}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Test URL
          </Button>
        </div>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="Business QR Code" 
                className="border rounded-lg shadow-lg"
              />
            </div>
            <Button 
              onClick={downloadQRCode}
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Generate a QR code that links directly to your booking page</li>
            <li>Customers can scan it with their phone camera</li>
            <li>They'll be taken directly to your public booking page</li>
            <li>No app download required!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
