import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  ArrowDownRight,
  AlertCircle, 
  Clock,
  InfoIcon,
  HelpCircle 
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { formatCurrency } from '@/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FinancialSummaryProps {
  transactions: any[];
  isLoading?: boolean;
}

export const FinancialSummary = ({ transactions = [], isLoading = false }: FinancialSummaryProps) => {
  const { subscription } = useSubscription();
  const isPAYG = subscription?.plan_type === 'payg';
  
  // Calculate commission rate based on subscription
  const getCommissionRate = () => {
    if (!subscription) return 0.05; // Default to PAYG rate
    
    if (subscription.plan_type === 'payg') return 0.05;
    if (subscription.plan_type === 'starter') return 0.05;
    if (subscription.plan_type === 'medium') return 0.05;
    if (subscription.plan_type === 'premium') return 0.05;
    return 0.05; // default
  };
  
  const commissionRate = getCommissionRate();
  
  // Calculate financial metrics
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const totalCommission = totalRevenue * commissionRate;
  const netEarnings = totalRevenue - totalCommission;
  
  // Get badge for subscription type
  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    
    // Only PAYG is available now
  return <Badge className="bg-orange-500">Pay As You Go</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading financial data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
        <CardTitle className="text-lg">
          Financial Summary
        </CardTitle>
        <div className="flex items-center gap-2">
          {getSubscriptionBadge()}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  {isPAYG 
                    ? "Pay As You Go: 5% commission on successful payments only, no monthly fees"
                    : `Your ${subscription?.plan_type} plan has a ${commissionRate * 100}% platform fee`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No financial data available yet</p>
            <p className="text-sm">
              Transactions will appear here once you start processing payments
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-orange-600 flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" /> 
                    {isPAYG ? 'PAYG Commission' : 'Platform Fee'}
                  </div>
                  <div className="text-xs text-orange-500 font-medium">
                    {commissionRate * 100}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalCommission)}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-green-600">Net Earnings</div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(netEarnings)}
                </div>
              </div>
            </div>
            
            {isPAYG && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-700">Pay As You Go Benefits</h4>
                    <p className="text-xs text-blue-600">
                      You're only charged when you get paid. No monthly fees, unlimited bookings, and full platform access.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Chart would go here for premium plans */}
            
            <div className="text-center text-xs text-gray-500">
              <p>Data based on {transactions.filter(t => t.status === 'completed').length} completed transactions</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
