
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BoinvitQRGenerator } from './BoinvitQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  // Fetch business details to get subdomain
  const { data: business } = useQuery({
    queryKey: ['business-subdomain', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('subdomain')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Error fetching business subdomain:', error);
        return null;
      }

      return data;
    },
    enabled: !!businessId
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Customer Booking QR Code</h3>
        <p className="text-sm text-blue-700 mb-4">
          When customers scan this QR code, they'll be taken directly to your booking page where they can:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• View all your available services</li>
          <li>• Select their preferred service</li>
          <li>• Choose appointment date and time</li>
          <li>• Complete their booking with payment</li>
          {business?.subdomain && (
            <li>• Accessed via your custom domain: {business.subdomain}.boinvit.com</li>
          )}
        </ul>
      </div>
      
      <BoinvitQRGenerator 
        businessId={businessId} 
        businessName={businessName}
        subdomain={business?.subdomain}
      />
    </div>
  );
};
