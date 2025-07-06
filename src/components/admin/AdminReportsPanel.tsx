
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatCurrency';
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
          <div className="flex gap-4 mb-4">
            {(['day', 'week', 'month', 'year'] as TimePeriod[]).map(period => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(platformStats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {platformStats?.transactionCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(platformStats?.platformFees || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  5% commission earned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {platformStats?.completedBookings || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.newSignups || 0}</div>
                <p className="text-xs text-muted-foreground">
                  New accounts this {selectedPeriod}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium">User Management Tools</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Administrative tools for managing user accounts and troubleshooting.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Reset User Email
                    </Button>
                    <Button variant="outline" size="sm">
                      Account Recovery
                    </Button>
                    <Button variant="outline" size="sm">
                      View User Activity
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
