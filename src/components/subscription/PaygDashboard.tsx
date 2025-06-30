import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { CommissionCalculation } from './CommissionCalculation';
import { PaygBanner } from './PaygBanner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PaygDashboard = ({ businessId }) => {
  const { subscription } = useSubscription();
  const isPaygSubscription = subscription?.plan_type === 'payg';
  
  // Fetch transactions for this business
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['payg-transactions', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction data');
        return [];
      }
      
      return data || [];
    },
    enabled: !!businessId && isPaygSubscription
  });

  if (!subscription) {
    return null;
  }
  
  if (!isPaygSubscription) {
    return <PaygBanner />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50 border-b border-orange-100">
          <CardTitle className="text-lg text-orange-800">
            Pay As You Go Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-orange-800">Your PAYG Plan is Active</h3>
                <p className="text-sm text-orange-700">
                  You're only charged a 5% commission when you successfully receive payment from clients
                </p>
              </div>
              <div className="text-sm bg-white px-3 py-2 rounded border border-orange-200">
                <span className="font-medium text-orange-800">Commission Rate:</span> 5%
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            With Pay As You Go, you have full access to all premium features with no monthly subscription fees.
            Commission is only calculated on successful payments.
          </p>
        </CardContent>
      </Card>
      
      <CommissionCalculation 
        transactions={transactions || []} 
        isLoading={isLoading}
      />
    </div>
  );
};
