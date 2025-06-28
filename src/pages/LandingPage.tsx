
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Shield,
  Smartphone,
  Globe,
  Clock,
  Zap,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceCategoriesRefresh } from '@/components/services/ServiceCategoriesRefresh';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book any service in just a few clicks with our intuitive interface',
      color: 'from-royal-blue to-royal-blue-dark'
    },
    {
      icon: Users,
      title: 'Trusted Providers',
      description: 'Connect with verified and highly-rated service providers',
      color: 'from-royal-red to-royal-red-dark'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Your transactions are protected with enterprise-grade security',
      color: 'from-royal-blue-light to-royal-blue'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access all features seamlessly on any device, anywhere',
      color: 'from-royal-red-light to-royal-red'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers', icon: Heart },
    { number: '500+', label: 'Service Providers', icon: Users },
    { number: '50,000+', label: 'Bookings Completed', icon: CheckCircle },
    { number: '99.9%', label: 'Uptime Guarantee', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-cream to-cream-dark">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-royal-blue/10 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
                alt="Boinvit Logo" 
                className="h-10 w-auto"
              />
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-royal-blue to-royal-red bg-clip-text text-transparent">
                Boinvit
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-2 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white font-bold px-6"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-royal-red to-royal-red-dark text-white font-bold px-6 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg mb-6 px-4 py-2 font-bold">
            <Star className="h-4 w-4 mr-2" />
            #1 Booking Platform in Kenya
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-royal-blue mb-6 leading-tight">
            Book Any Service,
            <span className="block bg-gradient-to-r from-royal-red to-royal-red-dark bg-clip-text text-transparent">
              Anytime, Anywhere
            </span>
          </h1>
          
          <p className="text-xl text-royal-blue/80 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
            From beauty treatments to transport services, find and book trusted professionals 
            in your area with our comprehensive booking platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-royal-blue to-royal-blue-dark text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Start Booking Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/business-discovery')}
              className="border-2 border-royal-red text-royal-red hover:bg-royal-red hover:text-white font-bold px-8 py-4 text-lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              Explore Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-white/90 backdrop-blur-sm border-royal-blue/10 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-royal-blue to-royal-red rounded-full flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-royal-blue mb-1">{stat.number}</div>
                    <div className="text-royal-blue/70 font-semibold">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-16 bg-gradient-to-br from-white/50 to-cream/30 backdrop-blur-sm">
        <ServiceCategoriesRefresh />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-royal-blue mb-4">Why Choose Boinvit?</h2>
            <p className="text-xl text-royal-blue/80 font-medium">Experience the future of service booking</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="service-card text-center group">
                  <CardHeader>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-royal-blue">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-royal-blue/80 font-medium">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-royal-blue to-royal-red">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 font-medium">
            Join thousands of satisfied customers who trust Boinvit for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-royal-blue hover:bg-cream font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/business-discovery')}
              className="border-2 border-white text-white hover:bg-white hover:text-royal-blue font-bold px-8 py-4 text-lg"
            >
              <Clock className="mr-2 h-5 w-5" />
              Browse Services
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-royal-blue text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
              alt="Boinvit Logo" 
              className="h-8 w-auto mr-3"
            />
            <span className="text-2xl font-bold">Boinvit</span>
          </div>
          <p className="text-white/80 font-medium">
            © 2024 Boinvit. All rights reserved. Your trusted booking platform.
          </p>
        </div>
      </footer>
    </div>
  );
};
