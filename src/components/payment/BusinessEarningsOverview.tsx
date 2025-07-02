import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useClientBusinessTransactions } from '@/hooks/useClientBusinessTransactions';
import { formatCurrency } from '@/utils';
import { DataRefreshPanel } from '@/components/dashboard/DataRefreshPanel';

interface BusinessEarningsOverviewProps {
  businessId: string;
}

export const BusinessEarningsOverview: React.FC<BusinessEarningsOverviewProps> = ({ businessId }) => {
  const { 
    transactions, 
    totalRevenue, 
    pendingAmount, 
    platformFees,
    grossRevenue,
    isLoading, 
    refetch 
  } = useClientBusinessTransactions(businessId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  // Force refresh function for transactions
  const refreshTransactions = () => {
    console.log('Manual refresh of transactions requested');
    refetch();
  };

  // Calculate available for payout (completed transactions within 24 hours)
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const availableForPayout = transactions
    .filter(t => t.status === 'completed' && new Date(t.created_at) >= last24Hours)
    .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse flex flex-col space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Refresh Panel */}
      <DataRefreshPanel businessId={businessId} />
      
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {transactions.filter(t => t.status === 'completed').length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available for Payout</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(availableForPayout)}</div>
            <p className="text-xs text-green-600">
              Ready for payout (last 24 hours)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              From {transactions.filter(t => t.status === 'pending').length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(platformFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              5% of total transaction value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Payout Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="flex justify-between items-center">
            <span>Available for immediate payout:</span>
            <span className="font-bold text-lg">{formatCurrency(availableForPayout)}</span>
          </div>
          <div className="text-xs text-blue-600">
            • Funds become available for payout 24 hours after transaction
            • Configure your payout methods in the Payouts tab
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No transactions yet</p>
              <p className="text-sm">Payments from clients will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{transaction.client_email}</span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </div>
                    {transaction.booking_id && (
                      <div className="text-xs text-gray-500">
                        Booking ID: {transaction.booking_id}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +{formatCurrency(Number(transaction.business_amount))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: {formatCurrency(Number(transaction.amount))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Fee: {formatCurrency(Number(transaction.platform_fee))}
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Showing 10 of {transactions.length} transactions
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h5 className="font-medium text-blue-900 mb-2">Revenue Sharing Information</h5>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Platform fee: 5% commission per transaction</p>
            <p>• You receive: 95% of each payment</p>
            <p>• Payouts processed 24 hours after transaction completion</p>
            <p>• Real-time transaction tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
