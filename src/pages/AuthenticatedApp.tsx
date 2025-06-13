
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BusinessSetup } from '@/components/dashboard/BusinessSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const AuthenticatedApp = () => {
  const { user } = useAuth();

  // Check if user has a business
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {!business ? (
        <BusinessSetup />
      ) : (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-royal-red to-royal-red-accent text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-royal-red-foreground/90 text-sm sm:text-base">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                <Calendar className="h-5 w-5 text-royal-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+0% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
                <Users className="h-5 w-5 text-royal-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 mt-1">Total clients</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">All up to date</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-royal-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">$0</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">Ready to grow</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
                <Settings className="h-5 w-5 text-royal-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 mt-1">Available services</p>
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                  <span className="text-xs text-amber-500">Add your first service</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-royal-red" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">New Booking</div>
                    <div className="text-sm text-gray-500">Schedule an appointment</div>
                  </button>
                  <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">Add Client</div>
                    <div className="text-sm text-gray-500">Register new client</div>
                  </button>
                  <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">Create Invoice</div>
                    <div className="text-sm text-gray-500">Generate billing</div>
                  </button>
                  <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">Add Service</div>
                    <div className="text-sm text-gray-500">Define new offering</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">No recent activity</p>
                  <p className="text-sm">Start by adding your first service!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
