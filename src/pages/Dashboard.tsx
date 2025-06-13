
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Ticket, Youtube, Download } from "lucide-react";
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [realTimeStats, setRealTimeStats] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    monthlyBookings: 0,
    totalClients: 0
  });

  // Fetch business data
  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const today = format(new Date(), 'yyyy-MM-dd');
      const currentMonth = format(new Date(), 'yyyy-MM');

      // Get active bookings for today
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('business_id', business.id)
        .eq('booking_date', today)
        .neq('status', 'cancelled');

      // Get monthly bookings
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('business_id', business.id)
        .gte('booking_date', `${currentMonth}-01`)
        .neq('status', 'cancelled');

      // Get total clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', business.id);

      const todayRevenue = todayBookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

      return {
        activeBookings: todayBookings?.length || 0,
        todayRevenue,
        monthlyBookings: monthlyBookings?.length || 0,
        totalClients: clients?.length || 0
      };
    },
    enabled: !!business,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!business) return;

    const channels = [
      supabase
        .channel('bookings-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `business_id=eq.${business.id}`
        }, () => {
          // Invalidate and refetch stats when bookings change
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        })
        .subscribe(),

      supabase
        .channel('clients-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'clients',
          filter: `business_id=eq.${business.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        })
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [business]);

  // Update local state when stats change
  useEffect(() => {
    if (stats) {
      setRealTimeStats(stats);
    }
  }, [stats]);

  const currency = business?.currency || 'USD';
  const formatPrice = (amount: number) => {
    if (currency === 'KES') {
      return `KES ${amount}`;
    }
    return `$${amount}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-600">
              {business ? `Welcome back to ${business.name}` : 'Manage your bookings, invoices, and clients'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Pro Plan
            </Badge>
            <Button>+ New Booking</Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <ArrowDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">Active appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <ArrowUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(realTimeStats.todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">From confirmed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.monthlyBookings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Youtube className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Registered clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Apps Download Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Mobile Apps</CardTitle>
            <CardDescription>
              Manage your business on the go with our mobile applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download for iOS
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download for Android
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Native mobile apps coming soon! Get notified when they're available.
            </p>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((booking) => (
                    <div key={booking} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">JD</span>
                        </div>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-gray-600">Haircut & Styling</p>
                          <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>Create and track your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ArrowUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                  <p className="text-gray-600 mb-4">Start creating professional invoices for your services</p>
                  <Button>Create First Invoice</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Directory</CardTitle>
                <CardDescription>Manage your customer relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Building your client base</h3>
                  <p className="text-gray-600 mb-4">Clients will appear here as they book through your QR codes</p>
                  <Button variant="outline">View All Clients</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Configure your business profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Business Information</h4>
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Services & Pricing</h4>
                    <Button variant="outline">Manage Services</Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Currency Settings</h4>
                    <p className="text-sm text-gray-600 mb-2">Current: {currency}</p>
                    <Button variant="outline">Update Currency</Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Custom Subdomain</h4>
                    <p className="text-sm text-gray-600 mb-2">your-business.bookflow.com</p>
                    <Button variant="outline">Update Subdomain</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
