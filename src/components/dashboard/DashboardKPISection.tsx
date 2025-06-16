
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSubscription } from '@/hooks/useSubscription';

export const DashboardKPISection = () => {
  const { stats, formatPrice, handleKpiRefresh } = useDashboardData();
  const { subscription } = useSubscription();

  const kpis = [
    {
      title: 'Today\'s Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      description: 'Active bookings for today',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Today\'s Revenue',
      value: formatPrice(stats?.todayRevenue || 0),
      icon: DollarSign,
      description: 'Revenue generated today',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Bookings',
      value: stats?.monthlyBookings || 0,
      icon: TrendingUp,
      description: 'Total bookings this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      description: 'All registered clients',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const getPlanDisplayInfo = () => {
    if (!subscription) return { name: 'No Plan', color: 'secondary' };
    
    switch (subscription.plan_type) {
      case 'trial':
        return { name: 'Free Trial', color: 'outline' };
      case 'medium':
        return { name: 'Medium Plan - KES 29/month', color: 'default' };
      case 'premium':
        return { name: 'Premium Plan - KES 99/month', color: 'destructive' };
      default:
        return { name: 'Unknown Plan', color: 'secondary' };
    }
  };

  const planInfo = getPlanDisplayInfo();

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Subscription</CardTitle>
              <CardDescription>Your active plan and limits</CardDescription>
            </div>
            <Badge variant={planInfo.color as any}>
              {planInfo.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Staff Limit</p>
              <p className="font-semibold">
                {subscription?.staff_limit || 'Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Monthly Bookings</p>
              <p className="font-semibold">
                {subscription?.bookings_limit || 'Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold text-green-600">
                {subscription?.status || 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Expires</p>
              <p className="font-semibold">
                {subscription?.current_period_end 
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleKpiRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
