
import React from 'react';
import { LandingPagePlans } from '@/components/subscription/LandingPagePlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  QrCode, 
  Smartphone, 
  CreditCard, 
  Users, 
  BarChart3,
  Clock,
  MapPin,
  Star,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Booking Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your business with QR code bookings, automated reminders, and seamless payments. 
            Start your 7-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/auth?mode=signup'}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/demo'}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Bookings
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to streamline your business operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">QR Code Booking</h3>
                <p className="text-gray-600">
                  Clients scan QR codes to view services, book appointments, and make payments instantly
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Mobile Optimized</h3>
                <p className="text-gray-600">
                  Perfect mobile experience for both you and your clients with responsive design
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <CreditCard className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Secure Payments</h3>
                <p className="text-gray-600">
                  Accept payments online with Pay Now/Pay Later options and automatic invoicing
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <Clock className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Smart Reminders</h3>
                <p className="text-gray-600">
                  Automated email, SMS, and WhatsApp reminders to reduce no-shows
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <Users className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Staff Management</h3>
                <p className="text-gray-600">
                  Manage your team, track attendance, and assign bookings efficiently
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center space-y-4">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Track performance, revenue, and customer insights with detailed reports
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <LandingPagePlans />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to streamline bookings and grow revenue
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => window.location.href = '/auth?mode=signup'}
          >
            Start Your 7-Day Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
