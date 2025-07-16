import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Download, 
  Bell,
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle,
  QrCode
} from 'lucide-react';

const AppDownloadPage = () => {
  const navigate = useNavigate();

  const mobileFeatures = [
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Never miss a booking or important update with instant notifications"
    },
    {
      icon: Calendar,
      title: "On-the-Go Booking",
      description: "Book services anytime, anywhere with our mobile-optimized interface"
    },
    {
      icon: MapPin,
      title: "Location Services",
      description: "Find nearby businesses and get directions with integrated maps"
    },
    {
      icon: Smartphone,
      title: "Offline Access",
      description: "View your bookings and business details even without internet"
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
              <h1 className="text-xl font-semibold">Mobile App</h1>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Experience
              </Badge>
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Take Boinvit Everywhere You Go
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Access all your business management tools from your mobile device. 
                Book services, manage appointments, and grow your business on the go.
              </p>
              
              {/* Coming Soon Notice */}
              <Card className="border-l-4 border-l-primary mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Download className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Mobile App Coming Soon!</h3>
                      <p className="text-muted-foreground mb-4">
                        We're currently developing native iOS and Android apps. 
                        In the meantime, enjoy our fully responsive web experience that works perfectly on all devices.
                      </p>
                      <Button onClick={() => navigate('/auth')} size="sm">
                        Try Web App Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm mx-auto">
                <div className="bg-muted rounded-2xl p-6 mb-6">
                  <QrCode className="h-24 w-24 text-muted-foreground mx-auto" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Scan to Access</h3>
                <p className="text-sm text-muted-foreground">
                  Use your phone camera to scan and access Boinvit instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Mobile-First Experience
            </h2>
            <p className="text-lg text-muted-foreground">
              All the power of Boinvit, optimized for your mobile device
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mobileFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Current Web Features */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Available Now: Mobile Web Experience
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Fully Responsive</h4>
                  <p className="text-sm text-muted-foreground">Works perfectly on all screen sizes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Fast Loading</h4>
                  <p className="text-sm text-muted-foreground">Optimized for mobile networks</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Progressive Web App</h4>
                  <p className="text-sm text-muted-foreground">Install on your home screen</p>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate('/auth')} size="lg">
              Try Mobile Web Experience
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Signup */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get Notified When We Launch
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Be the first to know when our mobile apps are available for download.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadPage;