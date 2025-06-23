
import React from 'react';
import { ReliableQRGenerator } from './ReliableQRGenerator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  const { data: business } = useQuery({
    queryKey: ['business-qr-details', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('address, phone')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  return (
    <div className="space-y-4">
      <ReliableQRGenerator 
        businessId={businessId} 
        businessName={businessName}
      />
      
      {business?.address && (
        <div className="text-center text-sm text-gray-600">
          <p>📍 {business.address}</p>
          {business.phone && <p>📞 {business.phone}</p>}
        </div>
      )}
    </div>
  );
};
