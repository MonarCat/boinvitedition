import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Shield,
  Scissors,
  CreditCard,
  Clock,
  Sparkles
} from 'lucide-react';
import { TrustedOrganizations } from '@/components/landing/TrustedOrganizations';
import { PricingSection } from '@/components/landing/PricingSection';
import { AIFeaturesSection } from '@/components/landing/AIFeaturesSection';
import { ensureAuthButtonsVisible } from '@/utils/buttonVisibility';

const LandingPage = () => {
  const navigate = useNavigate();

  // Ensure auth buttons stay visible and aren't covered by update prompts
  useEffect(() => {
    ensureAuthButtonsVisible();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Booking System",
      points: ["Online appointments", "Real-time availability", "Automated reminders"]
    },
    {
      icon: Users,
      title: "Customer Management",
      points: ["Client profiles", "Booking history", "Loyalty tracking"]
    },
    {
      icon: Scissors,
      title: "Service Management",
      points: ["Service catalog", "Staff assignments", "Pricing management"]
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      points: ["Multiple payment methods", "Secure transactions", "Invoice generation"]
    },
    {
      icon: Clock,
      title: "Staff Scheduling",
      points: ["Shift management", "Availability tracking", "Performance metrics"]
    },
    {
      icon: Sparkles,
      title: "Marketing Tools",
      points: ["SMS reminders", "Email campaigns", "Promotional offers"]
    },
    {
      icon: MapPin,
      title: "Multi-Location Support",
      points: ["Multiple branches", "Centralized dashboard", "Location analytics"]
    },
    {
      icon: Shield,
      title: "Business Insights",
      points: ["Revenue reports", "Customer analytics", "Booking trends"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mwangi",
      business: "Elegance Hair Salon",
      location: "Westlands, Nairobi",
      text: "Boinvit transformed how we manage bookings. No more double bookings or missed appointments. Our clients love the online booking system!",
      rating: 5
    },
    {
      name: "John Kamau",
      business: "Prime Cuts Barbershop",
      location: "Kilimani, Nairobi",
      text: "The payment integration and SMS reminders have reduced no-shows by 70%. My revenue has increased significantly since using Boinvit.",
      rating: 5
    },
    {
      name: "Grace Akinyi",
      business: "Glamour Beauty Spa",
      location: "Karen, Nairobi",
      text: "Managing 3 locations was chaotic. Now I can see everything from one dashboard - bookings, staff schedules, and revenue. Game changer!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags are in index.html */}
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
                alt="Boinvit Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Boinvit</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-royal-red transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-royal-red transition-colors">
                Pricing
              </a>
              <Link to="/contact" className="text-gray-600 hover:text-royal-red transition-colors">
                Contact
              </Link>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white auth-button relative z-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-royal-red hover:bg-royal-red/90 text-white auth-button relative z-50"
              >
                Start Free Trial
              </Button>
            </div>

            <div className="md:hidden">
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white auth-button relative z-50"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-royal-red/5 to-royal-red/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-royal-red/10 text-royal-red">
              For Salons & Barbershops
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Beauty Business
              <span className="text-royal-red"> With Smart Booking Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete booking platform for hair salons, barbershops, and beauty parlours. 
              Manage appointments, clients, payments, and staff — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-royal-red hover:bg-royal-red/90 text-white px-8 py-3 text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white px-8 py-3 text-lg"
              >
                Contact Sales
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Organizations */}
      <TrustedOrganizations />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Salon & Barbershop Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a successful beauty business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-royal-red">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6 text-royal-red" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-sm text-gray-600">
                    {feature.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Beauty Professionals Across East Africa
            </h2>
            <p className="text-lg text-gray-600">
              See how Boinvit is helping salons and barbershops grow their business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.business}, {testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-royal-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Beauty Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 100+ salons and barbershops already using Boinvit to manage bookings and grow revenue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-royal-red hover:bg-gray-50 px-8 py-3 text-lg"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-white text-white hover:bg-white hover:text-royal-red px-8 py-3 text-lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
                  alt="Boinvit Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">Boinvit</span>
              </div>
              <p className="text-gray-400">
                Booking and appointment management platform for beauty businesses and service providers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@boinvit.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +254 769 829 304
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Boinvit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
