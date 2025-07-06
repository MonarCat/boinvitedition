
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useClientBusinessTransactions } from '@/hooks/useClientBusinessTransactions';
import { formatCurrency } from '@/utils/formatCurrency';
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
  
  // Calculate available for payout (completed transactions older than 24 hours)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const availableForPayout = transactions
    .filter(t => t.status === 'completed' && new Date(t.created_at) <= twentyFourHoursAgo)
    .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);

  // Calculate pending amount (transactions within 24 hours)
  const recentPending = transactions
    .filter(t => t.status === 'completed' && new Date(t.created_at) > twentyFourHoursAgo)
    .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);

  // Calculate actual platform fees (5% of completed transactions)
  const actualPlatformFees = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.platform_fee || 0), 0);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataRefreshPanel businessId={businessId} />
      
      {/* Corrected Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Real)</CardTitle>
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
              Ready for payout ({'>'}24 hours old)
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{formatCurrency(recentPending)}</div>
            <p className="text-xs text-yellow-600">
              Recent payments ({'<'}24 hours)
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {formatCurrency(actualPlatformFees)}
            </div>
            <p className="text-xs text-orange-600">
              5% of completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Corrected Financial Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Financial Summary (Real Data)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total Earned:</span>
              <div className="text-lg font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            <div>
              <span className="font-medium">Platform Fees (5%):</span>
              <div className="text-lg font-bold text-orange-600">-{formatCurrency(actualPlatformFees)}</div>
            </div>
            <div>
              <span className="font-medium">Available Now:</span>
              <div className="text-lg font-bold text-green-600">{formatCurrency(availableForPayout)}</div>
            </div>
            <div>
              <span className="font-medium">Pending (24h rule):</span>
              <div className="text-lg font-bold text-yellow-600">{formatCurrency(recentPending)}</div>
            </div>
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
