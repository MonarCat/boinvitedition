
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedQRGenerator } from '@/components/qr/EnhancedQRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export const BusinessQRGenerator = () => {
  const { user } = useAuth();

  const { data: business, isLoading } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (!business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Please set up your business profile first to generate QR codes for bookings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">QR Code for Your Business</h2>
        <p className="text-gray-600">
          Generate and download QR codes that customers can scan to book appointments with your business.
        </p>
      </div>
      
      <EnhancedQRGenerator 
        businessId={business.id} 
        businessName={business.name} 
      />
    </div>
  );
};
