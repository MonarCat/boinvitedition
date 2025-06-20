
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductionReadinessCheck } from '@/components/settings/ProductionReadinessCheck';
import { SubdomainSettings } from '@/components/business/SubdomainSettings';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';

const ProductionCheckPage = () => {
  // Get business ID from user's businesses
  const { data: businesses } = useQuery({
    queryKey: ['user-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data;
    }
  });

  const businessId = businesses?.[0]?.id;
  const businessName = businesses?.[0]?.name;

  if (!businessId) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Production Readiness</h1>
            <p className="text-gray-600">No business found. Please create a business first.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Production Readiness</h1>
          <p className="text-gray-600">
            Check if your business is ready to accept bookings and payments from customers.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ProductionReadinessCheck businessId={businessId} />
            <SubdomainSettings businessId={businessId} />
          </div>
          
          <div>
            <QRCodeGenerator businessId={businessId} businessName={businessName} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductionCheckPage;
