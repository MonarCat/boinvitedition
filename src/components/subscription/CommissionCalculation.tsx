import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ChevronRight, TrendingUp, Clock, ArrowDown, AlertCircle } from 'lucide-react';

interface CommissionCalculationProps {
  transactions: any[];
  currency?: string;
  isLoading?: boolean;
}

const formatCurrency = (amount: number, currency: string = 'KES') => {
  return `${currency === 'KES' ? 'KSh' : currency} ${amount.toLocaleString()}`;
};

export const CommissionCalculation = ({ 
  transactions = [], 
  currency = 'KES',
  isLoading = false 
}: CommissionCalculationProps) => {
  // Calculate commissions
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const totalCommission = totalRevenue * 0.05; // 5% commission rate
  const netEarnings = totalRevenue - totalCommission;
  
  // Pending transactions
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pendingAmount = pendingTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const pendingCommission = pendingAmount * 0.05;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading commission data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="bg-orange-50 border-b border-orange-100">
        <CardTitle className="text-lg text-orange-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> 
            Pay As You Go Commission Report
          </span>
          {transactions.length > 0 && (
            <span className="text-sm font-normal text-orange-700">
              5% Commission Rate
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No transactions yet</p>
            <p className="text-sm">Commission details will appear when you receive payments</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currency)}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="text-sm text-orange-700 flex items-center gap-1 mb-1">
                  <ArrowDown className="h-3 w-3" /> 
                  Platform Commission (5%)
                </div>
                <div className="text-2xl font-bold text-orange-700">{formatCurrency(totalCommission, currency)}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-700 mb-1">Your Net Earnings</div>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(netEarnings, currency)}</div>
              </div>
            </div>
            
            {/* Pending Status */}
            {pendingTransactions.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-blue-700 flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" /> 
                      Pending Transactions
                    </div>
                    <div className="font-medium text-blue-800">
                      {pendingTransactions.length} pending payment(s) totaling {formatCurrency(pendingAmount, currency)}
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-blue-700">Est. Commission:</div>
                    <div className="font-medium">{formatCurrency(pendingCommission, currency)}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Commission Trend Chart would go here */}
            
            <div className="text-center text-sm text-gray-500 pt-2">
              <p>Pay As You Go plan - commission is only charged on successful payments</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
