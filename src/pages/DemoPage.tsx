import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CreditCard, BarChart3, ArrowLeft, Star, CheckCircle, Scissors } from 'lucide-react';

const DemoPage = () => {
  const navigate = useNavigate();

  const demoFeatures = [
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Smart Online Booking',
      description: 'Allow clients to book appointments 24/7 through your custom booking page. Real-time availability shows open slots, and automated confirmations keep everyone informed.',
      screenshots: [
        'Custom booking page with your branding',
        'Real-time calendar with available time slots',
        'Automated booking confirmations via SMS/Email'
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Client Management',
      description: 'Build detailed client profiles with booking history, preferences, and notes. Track loyalty, send personalized offers, and keep clients coming back.',
      screenshots: [
        'Client database with search and filters',
        'Individual client profiles and history',
        'Automated birthday and loyalty messages'
      ]
    },
    {
      icon: <Scissors className="h-6 w-6 text-primary" />,
      title: 'Service & Staff Management',
      description: 'Create your service menu with pricing, duration, and staff assignments. Manage stylist schedules, track performance, and optimize resource allocation.',
      screenshots: [
        'Service catalog with categories and pricing',
        'Staff schedule and availability management',
        'Performance metrics per stylist'
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: 'Payment Processing & Invoicing',
      description: 'Accept payments through multiple channels including M-Pesa, cards, and cash. Generate professional invoices and track all transactions in one place.',
      screenshots: [
        'Multiple payment options (M-Pesa, Card, Cash)',
        'Automated invoice generation',
        'Payment history and reports'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold">Platform Demo</h1>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Interactive Walkthrough
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">
            See Boinvit in Action
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how Boinvit helps salons, barbershops, and beauty parlours manage bookings, 
            clients, payments, and staff — all from one powerful platform.
          </p>
        </div>
      </div>

      {/* Demo Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Key Features Walkthrough
            </h2>
            <p className="text-lg text-muted-foreground">
              See how each feature helps you grow your beauty business
            </p>
          </div>

          <div className="space-y-12">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-8 mb-4">
                    <div className="text-center text-muted-foreground">
                      <div className="text-6xl mb-4">📸</div>
                      <p className="font-medium">Screenshot Preview</p>
                      <p className="text-sm mt-2">Feature demonstration coming soon</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-muted-foreground mb-2">What you'll see:</p>
                    {feature.screenshots.map((screenshot, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{screenshot}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-l-primary">
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Beauty Business?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join 100+ salons and barbershops using Boinvit to manage bookings and grow revenue
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;