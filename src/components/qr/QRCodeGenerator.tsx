
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy, Download, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const QRCodeGenerator = () => {
  const { user } = useAuth();
  const [qrSize, setQrSize] = useState(200);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: business, isLoading, error } = useQuery({
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const bookingUrl = useMemo(() => {
    if (!business?.id) return '';
    return `${window.location.origin}/booking/${business.id}`;
  }, [business?.id]);

  const qrApiUrl = useMemo(() => {
    if (!bookingUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(bookingUrl)}&format=png&ecc=M`;
  }, [bookingUrl, qrSize]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const downloadQR = useCallback(async () => {
    if (!qrApiUrl || !business?.name) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(qrApiUrl);
      if (!response.ok) throw new Error('Failed to fetch QR code');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.name.replace(/\s+/g, '-').toLowerCase()}-booking-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  }, [qrApiUrl, business?.name]);

  const shareQR = useCallback(async () => {
    if (!bookingUrl || !business?.name) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book with ${business.name}`,
          text: `Scan this QR code or click the link to book an appointment with ${business.name}.`,
          url: bookingUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
          copyToClipboard(bookingUrl);
          toast.info('Link copied. You can share it manually.');
        }
      }
    } else {
      copyToClipboard(bookingUrl);
      toast.info('Share not supported, link copied instead.');
    }
  }, [bookingUrl, business?.name, copyToClipboard]);

  const testBookingPage = useCallback(() => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer');
    }
  }, [bookingUrl]);

  const handleQrSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(100, Math.min(500, Number(e.target.value)));
    setQrSize(value);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Loading business information...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <QrCode className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Business</h3>
          <p className="text-gray-600">Unable to load business information. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Found</h3>
          <p className="text-gray-600">Set up your business first to generate QR codes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="qr-size">QR Code Size ({qrSize}px)</Label>
            <Input
              id="qr-size"
              type="range"
              min="100"
              max="500"
              step="50"
              value={qrSize}
              onChange={handleQrSizeChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Booking URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={bookingUrl}
                readOnly
                className="bg-gray-50 text-sm"
                aria-label="Booking URL"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(bookingUrl)}
                aria-label="Copy booking URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={downloadQR} 
              variant="outline" 
              disabled={isDownloading || !business.name}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
            <Button onClick={shareQR} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <Button onClick={testBookingPage} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Booking Page
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Preview</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-block p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            {qrApiUrl ? (
              <img
                src={qrApiUrl}
                alt={`QR Code for booking with ${business.name}`}
                className="mx-auto"
                width={qrSize}
                height={qrSize}
                loading="lazy"
                onError={(e) => {
                  console.error('QR code failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex items-center justify-center" style={{ width: qrSize, height: qrSize }}>
                <p className="text-gray-500">Generating QR Code...</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Customers can scan this QR code to book appointments directly
          </p>
          {business.name && (
            <div className="text-xs text-gray-500 mt-2 break-all">
              {business.name} • {bookingUrl}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
