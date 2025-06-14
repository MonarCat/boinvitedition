import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import DemoVideo from '@/components/demo/DemoVideo';

const DemoPage = () => {
  // Sample demo data for demonstration
  const demoBookings = [
    {
      id: '1',
      clientName: 'John Doe (Demo)',
      service: 'Premium Haircut',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: '2',
      clientName: 'Jane Smith (Demo)',
      service: 'Business Class Flight - NYC to London',
      date: '2024-01-20',
      time: '2:30 PM',
      status: 'pending'
    },
    {
      id: '3',
      clientName: 'Mike Johnson (Demo)',
      service: 'Hotel Suite Booking',
      date: '2024-01-18',
      time: '3:00 PM',
      status: 'completed'
    }
  ];

  const demoFeatures = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Smart Booking System',
      description: 'Automated scheduling with conflict detection and optimal time slot suggestions.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Customer Management',
      description: 'Complete client profiles with booking history and preferences.'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Transport Integration',
      description: 'Full transport services with route planning and real-time tracking.'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Global Payments',
      description: 'Multi-currency support with international payment gateways.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Boinvit Platform Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of business management with our comprehensive booking and service platform.
            Compete globally with Booking.com and local leaders like Buupass.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Platform Overview
              </CardTitle>
              <CardDescription>
                Watch how Boinvit revolutionizes business operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoVideo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Bookings Dashboard</CardTitle>
              <CardDescription>
                Sample bookings showing real-world usage (Demo Data Only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.clientName}</p>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                      <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoFeatures.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="text-center">
                <div className="flex justify-center text-blue-600 mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg opacity-90">
              Join thousands of businesses already using Boinvit to streamline their operations.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DemoPage;
