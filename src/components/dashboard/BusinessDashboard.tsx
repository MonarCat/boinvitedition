
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessBookings } from '@/hooks/useBusinessBookings';
import { CalendarDays, Clock, DollarSign, Users, Calendar, LineChart, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export function BusinessDashboard() {
  const { 
    services, 
    staff, 
    bookings,
    todayRevenue, 
    todayBookingCount,
    isLoading,
    refreshBookings
  } = useBusinessBookings();

  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    return bookings.reduce((sum, booking) => sum + booking.amount, 0);
  }, [bookings]);

  // Upcoming bookings
  const upcomingBookings = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.date >= today)
      .slice(0, 5); // Take 5 most recent
  }, [bookings]);

  // Recent clients
  const recentClients = React.useMemo(() => {
    const uniqueClients = Array.from(
      new Map(bookings.map(booking => [booking.client_email, booking])).values()
    ).slice(0, 5);
    return uniqueClients;
  }, [bookings]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading dashboard data...</div>;
  }

  return (
    <div className="px-4 md:px-6 space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button 
          onClick={() => refreshBookings()} 
          variant="outline" 
          className="ml-auto"
        >
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${todayRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayBookingCount} bookings today
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bookings.length} total bookings
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Services
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {services.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {services.filter(s => s.price > 0).length} paid services
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Staff Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {staff.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {staff.filter(s => s.is_active).length} active members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> 
                Upcoming Bookings
              </CardTitle>
              <CardDescription>
                Your next {upcomingBookings.length} appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {booking.service_name}
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
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-6">
                    No upcoming bookings
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/app/bookings'}
              >
                View All Bookings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Your most recent booking activity
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <div className="font-medium">${booking.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
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
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {service.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${service.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {bookings.filter(b => b.service_id === service.id).length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {client.client_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {client.client_email}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          ${client.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
