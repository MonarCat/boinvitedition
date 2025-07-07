
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  UserPlus
} from 'lucide-react';
import { formatCurrency } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const AdminStatsDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Error loading admin stats: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Businesses"
        value={stats?.business_count || 0}
        icon={<Building2 className="h-4 w-4" />}
        color="blue"
      />
      
      <StatCard
        title="Active Users"
        value={stats?.active_users || 0}
        icon={<Users className="h-4 w-4" />}
        trend="Last 30 days"
        color="green"
      />
      
      <StatCard
        title="Total Bookings"
        value={stats?.total_bookings || 0}
        icon={<Calendar className="h-4 w-4" />}
        color="purple"
      />
      
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(stats?.today_revenue || 0, 'KES')}
        icon={<DollarSign className="h-4 w-4" />}
        color="green"
      />
      
      <StatCard
        title="Platform Fees Today"
        value={formatCurrency(stats?.platform_fees_today || 0, 'KES')}
        icon={<TrendingUp className="h-4 w-4" />}
        trend="5% commission"
        color="yellow"
      />
      
      <StatCard
        title="Pending Payouts"
        value={stats?.pending_payouts || 0}
        icon={<Clock className="h-4 w-4" />}
        color="yellow"
      />
      
      <StatCard
        title="New Signups Today"
        value={stats?.new_signups_today || 0}
        icon={<UserPlus className="h-4 w-4" />}
        color="blue"
      />
    </div>
  );
};
