import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Settings,
  Crown,
  ArrowUp,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils';
import { TimePeriodSelector, TimePeriod } from './TimePeriodSelector';

interface Business {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface DashboardKPISectionProps {
  business: Business | null;
  stats: {
    activeBookings: number;
    totalRevenue: number;
    totalBookings: number;
    totalClients: number;
  } | null; // Allow stats to be null
  currency: string;
  formatPrice?: (amount: number) => string; // Made optional since we'll use formatCurrency
  onRefresh: () => void;
  onEditBusiness: () => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

export const DashboardKPISection = ({ 
  business,
  stats, 
  currency, 
  formatPrice, 
  onRefresh, 
  onEditBusiness,
  timePeriod,
  onTimePeriodChange
}: DashboardKPISectionProps) => {
  const navigate = useNavigate();

  // If stats are not yet available, render a loading state or null.
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Stats...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading key metrics...</p>
        </CardContent>
      </Card>
    );
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today': return "Today's";
      case 'week': return "This Week's";
      case 'month': return "This Month's";
      case 'year': return "This Year's";
      default: return "Today's";
    }
  };

  const kpis = [
    {
      title: `${getPeriodLabel(timePeriod)} Bookings`,
      value: stats.activeBookings,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: `${getPeriodLabel(timePeriod)} Revenue`,
      value: formatCurrency(stats.totalRevenue, currency),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: `${getPeriodLabel(timePeriod)} Total Bookings`,
      value: stats.totalBookings,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const handleUpgradeClick = () => {
    navigate('/app/subscription');
  };

  return (
    <div className="space-y-6">
      {/* Business Status and Subscription Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {business?.name || 'Your Business'}
                {business?.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete business management platform - bookings, invoicing, staff management & more
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Trial Plan
              </Badge>
              <Button variant="outline" size="sm" onClick={onEditBusiness}>
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <TimePeriodSelector value={timePeriod} onChange={onTimePeriodChange} />
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Subscription Notice */}
      <Card className="border-royal-red bg-gradient-to-r from-royal-red/5 to-royal-red/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-royal-red">Pay As You Go Plan</h3>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Only 5% commission on payments received</strong> • <strong>No monthly fees</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Unlimited staff, unlimited bookings, full platform access and priority support
              </p>
            </div>
            <Button 
              onClick={handleUpgradeClick}
              size="sm" 
              className="bg-royal-red hover:bg-royal-red/90 text-white"
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              Manage Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
