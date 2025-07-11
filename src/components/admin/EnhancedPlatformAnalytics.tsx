import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatCurrency';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Building2,
  CreditCard,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

interface PlatformMetrics {
  totalRevenue: number;
  platformFees: number;
  businessPayouts: number;
  totalTransactions: number;
  completedTransactions: number;
  totalBookings: number;
  completedBookings: number;
  activeBusinesses: number;
  totalBusinesses: number;
  newSignups: number;
  averageTransactionValue: number;
  conversionRate: number;
  previousPeriodRevenue?: number;
  previousPeriodTransactions?: number;
}

export const EnhancedPlatformAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['enhanced-platform-analytics', selectedPeriod],
    queryFn: async (): Promise<PlatformMetrics> => {
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      
      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate = new Date(weekStart.setHours(0, 0, 0, 0));
          previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'quarter':
          const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterMonth, 1);
          previousStartDate = new Date(now.getFullYear(), quarterMonth - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
          break;
      }

      // Get current period transactions with precise calculations
      const { data: transactions } = await supabase
        .from('client_business_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', now.toISOString());

      // Get previous period transactions for comparison
      const { data: previousTransactions } = await supabase
        .from('client_business_transactions')
        .select('*')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Get bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', now.toISOString());

      // Get business data
      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('id, is_active, created_at');

      // Get new signups in period
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', now.toISOString());

      // Calculate metrics with precision
      const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];
      const previousCompletedTransactions = previousTransactions?.filter(t => t.status === 'completed') || [];

      // Total revenue (sum of all transaction amounts)
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const previousPeriodRevenue = previousCompletedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // Platform fees (5% commission)
      const platformFees = completedTransactions.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0);

      // Business payouts (95% of revenue)
      const businessPayouts = completedTransactions.reduce((sum, t) => sum + Number(t.business_amount || 0), 0);

      // Booking metrics
      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];

      // Business metrics
      const activeBusinesses = allBusinesses?.filter(b => b.is_active)?.length || 0;
      const totalBusinesses = allBusinesses?.length || 0;

      // Advanced calculations
      const averageTransactionValue = completedTransactions.length > 0 
        ? totalRevenue / completedTransactions.length 
        : 0;

      const conversionRate = bookings?.length > 0 
        ? (completedBookings.length / bookings.length) * 100 
        : 0;

      return {
        totalRevenue,
        platformFees,
        businessPayouts,
        totalTransactions: transactions?.length || 0,
        completedTransactions: completedTransactions.length,
        totalBookings: bookings?.length || 0,
        completedBookings: completedBookings.length,
        activeBusinesses,
        totalBusinesses,
        newSignups: newUsers?.length || 0,
        averageTransactionValue,
        conversionRate,
        previousPeriodRevenue,
        previousPeriodTransactions: previousCompletedTransactions.length
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
    staleTime: 15000 // Consider data stale after 15 seconds
  });

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = metrics?.previousPeriodRevenue 
    ? calculatePercentageChange(metrics.totalRevenue, metrics.previousPeriodRevenue)
    : 0;

  const transactionChange = metrics?.previousPeriodTransactions 
    ? calculatePercentageChange(metrics.completedTransactions, metrics.previousPeriodTransactions)
    : 0;

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    suffix = '', 
    prefix = '',
    color = 'default' 
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    suffix?: string;
    prefix?: string;
    color?: 'default' | 'green' | 'blue' | 'purple';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${
          color === 'green' ? 'text-green-600' :
          color === 'blue' ? 'text-blue-600' :
          color === 'purple' ? 'text-purple-600' :
          'text-muted-foreground'
        }`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color === 'green' ? 'text-green-600' : ''}`}>
          {prefix}{value}{suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change).toFixed(1)}% from last {selectedPeriod}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Platform Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'quarter', 'year'] as TimePeriod[]).map(period => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod(period)}
            size="sm"
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics?.totalRevenue || 0)}
              icon={DollarSign}
              change={revenueChange}
              color="default"
            />
            
            <MetricCard
              title="Platform Fees (5%)"
              value={formatCurrency(metrics?.platformFees || 0)}
              icon={TrendingUp}
              color="green"
            />
            
            <MetricCard
              title="Business Payouts (95%)"
              value={formatCurrency(metrics?.businessPayouts || 0)}
              icon={Building2}
              color="blue"
            />
            
            <MetricCard
              title="Avg Transaction Value"
              value={formatCurrency(metrics?.averageTransactionValue || 0)}
              icon={CreditCard}
              color="purple"
            />
          </div>

          {/* Transaction & Booking Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Completed Transactions"
              value={metrics?.completedTransactions || 0}
              icon={CreditCard}
              change={transactionChange}
            />
            
            <MetricCard
              title="Total Bookings"
              value={metrics?.totalBookings || 0}
              icon={Calendar}
            />
            
            <MetricCard
              title="Conversion Rate"
              value={(metrics?.conversionRate || 0).toFixed(1)}
              suffix="%"
              icon={TrendingUp}
              color="green"
            />
            
            <MetricCard
              title="New Signups"
              value={metrics?.newSignups || 0}
              icon={Users}
              color="blue"
            />
          </div>

          {/* Business Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.activeBusinesses || 0}
                  </div>
                  <p className="text-sm text-gray-600">Active Businesses</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {metrics?.totalBusinesses || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Businesses</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {metrics?.totalBusinesses > 0 
                      ? ((metrics.activeBusinesses / metrics.totalBusinesses) * 100).toFixed(1)
                      : 0}% Active Rate
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};