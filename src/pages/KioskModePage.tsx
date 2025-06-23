
import React from 'react';
import { useParams } from 'react-router-dom';
import { KioskMode } from '@/components/staff/KioskMode';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const KioskModePage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['kiosk-business', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('Business ID is required');
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading kiosk...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              Business not found or access denied
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <KioskMode businessId={businessId!} />;
};

export default KioskModePage;
