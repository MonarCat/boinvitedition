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
  // All businesses use PAYG model now
  const isPaygSubscription = true;
  
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
    enabled: !!businessId
  });

  // Always show PAYG dashboard

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <CardTitle className="text-lg text-primary">
            Pay As You Earn - 5% Commission
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-primary">Pay As You Earn Model Active</h3>
                <p className="text-sm text-muted-foreground">
                  Simple pricing: We only take 5% commission when you successfully get paid by clients
                </p>
              </div>
              <div className="text-sm bg-background px-3 py-2 rounded border border-primary/20">
                <span className="font-medium text-primary">Commission:</span> 5%
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            No monthly fees, no subscriptions, no hidden costs. You only pay when you earn.
            Full access to all features with just a 5% commission on successful payments.
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
