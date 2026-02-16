import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessBookings } from '@/hooks/useBusinessBookings';
import { 
  CalendarDays, Clock, DollarSign, Users, Calendar, LineChart, Activity, 
  TrendingUp, ArrowUpRight, AlertCircle, CheckCircle, User, RefreshCcw,
  CreditCard, CircleDollarSign, FileClock, UserPlus, Banknote
} from 'lucide-react';
import { format, parseISO, isToday, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; 
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking, Service, StaffMember as Staff } from '@/types/models';
import { formatCurrency } from '@/utils/formatCurrency';
import { PlatformBalanceSummary } from '@/components/platform/PlatformBalanceSummary';
import { PlatformBreakdownModal } from '@/components/platform/PlatformBreakdownModal';

// Interface for payment transactions
interface PaymentTransaction {
  id: string;
  reference?: string;
  status: string;
  amount: number;
  business_amount?: number;
  customer_email?: string;
  description?: string;
  business_id: string;
  created_at: string;
  updated_at?: string;
  // Add any other fields that might exist in the actual data
  [key: string]: unknown;
}

// Interface for clients
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_id: string;
  created_at: string;
  updated_at?: string;
}

export function BusinessDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  
  const { 
    services, 
    staff, 
    bookings,
    todayRevenue, 
    todayBookingCount,
    isLoading,
    refreshBookings
  } = useBusinessBookings();

  // Get businessId
  const { data: business } = useQuery({
    queryKey: ['current-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  const businessId = business?.id;

  // Use real-time hook for business
  const realtime = useDashboardRealtime(businessId);

  // Fetch payments and clients
  useEffect(() => {
    if (businessId) {
      // Fetch payment transactions
      const fetchPayments = async () => {
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!error && data) {
          setPayments(data);
        }
      };
      
      // Fetch clients
      const fetchClients = async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setClients(data);
        }
      };
      
      fetchPayments();
      fetchClients();
    }
  }, [businessId]);

  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    return bookings.reduce((sum, booking) => sum + booking.amount, 0);
  }, [bookings]);

  // Upcoming bookings - next 7 days
  const upcomingBookings = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Take 5 most recent
  }, [bookings]);

  // Recent bookings - last 7 days
  const recentBookings = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    return bookings
      .filter(booking => booking.date <= today && booking.date >= sevenDaysAgoStr)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Take 5 most recent
  }, [bookings]);

  // Recent payments
  const recentPayments = React.useMemo(() => {
    return payments
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];
  }, [payments]);

  // Recent clients - with most recent booking date
  const recentClients = React.useMemo(() => {
    // Group bookings by client email and take the most recent booking per client
    const clientMap = new Map();
    
    bookings.forEach(booking => {
      const existingClient = clientMap.get(booking.client_email);
      if (!existingClient || new Date(booking.date) > new Date(existingClient.date)) {
        clientMap.set(booking.client_email, booking);
      }
    });
    
    // Convert map values to array and sort by date (most recent first)
    return Array.from(clientMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [bookings]);

  // Business metrics
  const metrics = React.useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // This month revenue
    const thisMonthRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= thisMonthStart && bookingDate <= now;
      })
      .reduce((sum, booking) => sum + booking.amount, 0);
      
    // Last month revenue
    const lastMonthRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
      })
      .reduce((sum, booking) => sum + booking.amount, 0);
    
    // Monthly change percentage
    const monthlyChangePercentage = lastMonthRevenue === 0 
      ? 100 
      : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    
    // Upcoming revenue (future bookings)
    const upcomingRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate > now;
      })
      .reduce((sum, booking) => sum + booking.amount, 0);
    
    // New clients this month
    const clientsThisMonth = new Set(
      bookings
        .filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= thisMonthStart && bookingDate <= now;
        })
        .map(booking => booking.client_email)
    ).size;
    
    return {
      thisMonthRevenue,
      lastMonthRevenue,
      monthlyChangePercentage,
      upcomingRevenue,
      clientsThisMonth
    };
  }, [bookings]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading dashboard data...</div>;
  }

  return (
    <div className="px-4 md:px-6 space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Business Performance</h2>
        <Button 
          onClick={() => refreshBookings()} 
          variant="outline" 
          className="ml-auto gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Summary Cards - Always Visible */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(todayRevenue)}
            </div>
            <p className="text-xs text-green-700">
              {todayBookingCount} bookings today
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(metrics.thisMonthRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={metrics.monthlyChangePercentage >= 0 ? "text-green-600" : "text-red-600"}>
                {metrics.monthlyChangePercentage >= 0 ? "+" : ""}{metrics.monthlyChangePercentage.toFixed(1)}%
              </span>
              <span className="text-blue-700">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              New Clients
            </CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {metrics.clientsThisMonth}
            </div>
            <p className="text-xs text-purple-700">
              {clients?.length || 0} total clients
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Upcoming Revenue
            </CardTitle>
            <Banknote className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(metrics.upcomingRevenue)}
            </div>
            <p className="text-xs text-amber-700">
              {upcomingBookings.length} upcoming bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Balance Section */}
      {businessId && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <PlatformBalanceSummary businessId={businessId} />
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Platform Fee Details</CardTitle>
                  <PlatformBreakdownModal businessId={businessId} />
                </div>
                <CardDescription>
                  Transparent breakdown of platform fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Commission Rate</span>
                    <span className="font-semibold">3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">You Receive</span>
                    <span className="font-semibold text-green-600">97% of booking amount</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>How it works:</strong> Clients pay you directly for services. 
                      A 3% platform fee accumulates from completed bookings and should be 
                      cleared regularly to continue accepting new bookings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Today's Schedule */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" /> 
                  Today's Schedule
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {upcomingBookings
                    .filter(booking => isToday(parseISO(booking.date)))
                    .length > 0 ? (
                    upcomingBookings
                      .filter(booking => isToday(parseISO(booking.date)))
                      .map(booking => (
                        <div 
                          key={booking.id} 
                          className="flex items-center gap-4 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="bg-blue-100 text-blue-800 rounded-md p-2 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{booking.service_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.client_name}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {booking.time}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                      <Calendar className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No bookings scheduled for today</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link to="/app/bookings">Manage Bookings</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Total today: <span className="font-medium text-foreground">
                    {upcomingBookings.filter(booking => isToday(parseISO(booking.date))).length} bookings
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/bookings">
                    View Calendar
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" /> 
                    Upcoming Bookings
                  </CardTitle>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    Next 7 Days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-0">
                <div className="space-y-4">
                  {upcomingBookings
                    .filter(booking => !isToday(parseISO(booking.date)))
                    .slice(0, 5)
                    .map(booking => {
                      const daysUntil = differenceInDays(parseISO(booking.date), new Date());
                      return (
                        <div 
                          key={booking.id} 
                          className="flex items-center justify-between border-b pb-3"
                        >
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {booking.service_name}
                              {daysUntil <= 1 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">Soon</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.client_name}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="font-medium">
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {booking.time}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <Link to="/app/bookings">
                    View All Bookings
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Clients */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-600" /> 
                  Recent Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-0">
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between border-b pb-3">
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {client.client_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {client.client_email}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium">
                          {formatCurrency(client.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(client.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <Link to="/app/clients">
                    Manage Clients
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent Payments */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" /> 
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-0">
                {recentPayments.length > 0 ? (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between border-b pb-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {payment.description || 'Payment'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.customer_email || payment.reference?.substring(0, 12)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm font-medium text-emerald-600">
                            {formatCurrency(payment.business_amount || payment.amount)}
                          </div>
                          <div className="text-xs">
                            <Badge variant={payment.status === 'success' ? 'default' : 'outline'} className="font-normal">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <CircleDollarSign className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No recent payments found</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <Link to="/app/finance">
                    View All Transactions
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your most recent booking activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/bookings">All Bookings</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.slice(0, 10).map(booking => (
                    <div 
                      key={booking.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-4"
                    >
                      <div>
                        <div className="font-medium">{booking.service_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {booking.client_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(booking.amount)}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileClock className="h-3 w-3" />
                            {format(new Date(booking.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-50" />
                  <p>No bookings found</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/app/services">Add Services First</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming bookings timeline */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Upcoming Timeline</CardTitle>
                  <CardDescription>
                    Your scheduled appointments
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                  
                  <div className="space-y-8 relative pl-12">
                    {upcomingBookings.map((booking, index) => {
                      const isToday = new Date(booking.date).toDateString() === new Date().toDateString();
                      return (
                        <div key={booking.id} className="relative">
                          {/* Timeline circle */}
                          <div className={`absolute -left-12 w-4 h-4 rounded-full ${
                            isToday ? 'bg-blue-600' : 'bg-gray-300'
                          } border-2 border-white`}></div>
                          
                          <div className={`p-4 rounded-lg ${
                            isToday ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isToday ? 'default' : 'outline'}>
                                {isToday ? 'Today' : format(new Date(booking.date), 'EEEE, MMM d')}
                              </Badge>
                              <span className="text-sm font-medium">{booking.time}</span>
                            </div>
                            <div className="font-medium">{booking.service_name}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex justify-between items-center">
                              <span>{booking.client_name}</span>
                              <span className="font-medium">{formatCurrency(booking.amount)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-50" />
                  <p>No upcoming bookings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Payment Activity</CardTitle>
                  <CardDescription>
                    Your recent payment transactions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/finance">All Transactions</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPayments && recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          payment.status === 'success' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {payment.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{payment.description || 'Payment'}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.customer_email || payment.reference}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:ml-auto">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), 'MMM d, yyyy • h:mm a')}
                        </div>
                        <div className="text-lg font-medium text-green-600">
                          {formatCurrency(payment.business_amount || payment.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CircleDollarSign className="h-12 w-12 mb-4 opacity-50" />
                  <p>No payment transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Your revenue trend for the past 3 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* This Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'long' })}
                    </div>
                    <div className="font-bold">{formatCurrency(metrics.thisMonthRevenue)}</div>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                {/* Last Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
                        .toLocaleDateString('en-US', { month: 'long' })}
                    </div>
                    <div className="font-bold">{formatCurrency(metrics.lastMonthRevenue)}</div>
                  </div>
                  <Progress value={metrics.lastMonthRevenue / (metrics.thisMonthRevenue || 1) * 100} 
                    className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Your booking and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <LineChart className="h-12 w-12 mb-2 opacity-50" />
                <p>Revenue analytics chart will appear here</p>
                <p className="text-sm">(Coming soon)</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.slice(0, 5).map((service) => {
                    const serviceBookings = bookings.filter(b => b.service_id === service.id);
                    const totalServiceRevenue = serviceBookings.reduce((sum, booking) => 
                      sum + booking.amount, 0
                    );
                    
                    return (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {service.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(service.price)} per booking
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">
                              {serviceBookings.length} bookings
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <Progress 
                          value={(serviceBookings.length / (bookings.length || 1)) * 100} 
                          className="h-1" 
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.slice(0, 5).map((staffMember) => {
                    // Filter bookings by staff member - use safe check
                    const staffBookings = bookings.length > 0 ? 
                      bookings.filter(b => 'staff_id' in b && b.staff_id === staffMember.id) : 
                      [];
                      
                    const staffRevenue = staffBookings.reduce((sum, booking) => 
                      sum + booking.amount, 0
                    );
                    
                    return (
                      <div key={staffMember.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {staffMember.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {'role' in staffMember && typeof staffMember.role === 'string' ? staffMember.role : 'Staff Member'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {formatCurrency(staffRevenue)}
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={(staffBookings.length / (bookings.length || 1)) * 100} 
                          className="h-1" 
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
