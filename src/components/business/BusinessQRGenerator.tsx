
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BoinvitQRGenerator } from '@/components/qr/BoinvitQRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AlertCircle } from 'lucide-react';

export const BusinessQRGenerator = () => {
  const { user } = useAuth();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching business for QR generation:', user.id);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Business fetch error:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  if (isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            Error Loading Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            Failed to load your business information. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Business Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            You need to set up your business profile before generating QR codes.
          </p>
          <button
            onClick={() => window.location.href = '/app/settings'}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            Set Up Business Profile
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">QR Code for Your Business</h2>
        <p className="text-gray-600">
          Generate and share QR codes that customers can scan to book appointments with {business.name}.
        </p>
      </div>
      
      <BoinvitQRGenerator 
        businessId={business.id} 
        businessName={business.name} 
      />
    </div>
  );
};
