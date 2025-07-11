
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatCurrency';
import { EnhancedPlatformAnalytics } from './EnhancedPlatformAnalytics';
import { EnhancedUserManagement } from './EnhancedUserManagement';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

export const AdminReportsPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day');

  // Get businesses awaiting payouts
  const { data: payoutRequests, refetch: refetchPayouts } = useQuery({
    queryKey: ['admin-payout-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_business_transactions')
        .select(`
          *,
          businesses!inner(name, email)
        `)
        .eq('status', 'completed')
        .eq('payout_status', 'pending')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  });

  // Get platform statistics
  const { data: platformStats } = useQuery({
    queryKey: ['admin-platform-stats', selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      // Get transactions data
      const { data: transactions } = await supabase
        .from('client_business_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Get bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Get new user signups
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const platformFees = completedTransactions.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0);

      return {
        totalRevenue,
        platformFees,
        totalBookings: bookings?.length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        newSignups: profiles?.length || 0,
        transactionCount: completedTransactions.length
      };
    }
  });

  const handleResetUserAccount = async (userId: string) => {
    // This would require additional implementation
    console.log('Reset user account:', userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Reports Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPayouts()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Accounts Awaiting Payouts
                <Badge variant="destructive">{payoutRequests?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payoutRequests?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pending payouts</p>
              ) : (
                <div className="space-y-4">
                  {payoutRequests?.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.businesses?.name}</h4>
                        <p className="text-sm text-gray-600">{request.businesses?.email}</p>
                        <p className="text-xs text-gray-500">
                          Transaction: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(Number(request.business_amount))}
                        </div>
                        <div className="text-xs text-gray-500">
                          Platform Fee: {formatCurrency(Number(request.platform_fee))}
                        </div>
                        <Badge className="mt-1">Ready for Payout</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EnhancedPlatformAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <EnhancedUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
