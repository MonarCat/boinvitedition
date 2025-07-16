import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Users, MapPin, CreditCard, ArrowLeft, Star } from 'lucide-react';
import DemoVideo from '@/components/demo/DemoVideo';

const DemoPage = () => {
  const navigate = useNavigate();

  const demoFeatures = [
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Smart Booking System',
      description: 'Automated scheduling with conflict detection and optimal time slot suggestions.'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Customer Management',
      description: 'Complete client profiles with booking history and preferences.'
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: 'Transport Integration',
      description: 'Full transport services with route planning and real-time tracking.'
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: 'Global Payments',
      description: 'Multi-currency support with international payment gateways.'
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
            <Play className="h-4 w-4 mr-2" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">
            See Boinvit in Action
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of business management with our comprehensive platform that helps you compete with global and local leaders.
          </p>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoVideo />
        </div>
      </div>

      {/* Demo Features */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Explore Key Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover what makes Boinvit the complete business management solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-l-primary">
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of businesses already using Boinvit's pay-as-you-go platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  <Play className="h-4 w-4 mr-2" />
                  Start with Pay As You Go
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/discover')}>
                  Explore Businesses
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