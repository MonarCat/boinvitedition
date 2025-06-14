import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Receipt, 
  Star, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Shield,
  Globe
} from 'lucide-react';
import { GlobalPartnersSlider } from '@/components/landing/GlobalPartnersSlider';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Smart Booking System",
      description: "Advanced scheduling with automated reminders and capacity management"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Comprehensive customer profiles with booking history and preferences"
    },
    {
      icon: Receipt,
      title: "Invoice & Payments",
      description: "Professional invoicing with integrated international payment processing"
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Build trust with customer feedback and testimonials"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Support for multiple currencies and international businesses"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      business: "Elegant Beauty Spa",
      location: "New York, USA",
      text: "Boinvit transformed how we manage bookings. Our efficiency increased by 60%!",
      rating: 5
    },
    {
      name: "James Smith",
      business: "FitLife Gym",
      location: "London, UK",
      text: "The automated reminders reduced no-shows significantly. Highly recommended!",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      business: "HealthCare Plus",
      location: "Toronto, Canada",
      text: "Professional invoicing made our billing process seamless and transparent.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$25",
      period: "/month",
      features: [
        "Up to 100 bookings/month",
        "Basic calendar management",
        "Client database",
        "Email notifications",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$50",
      period: "/month",
      features: [
        "Unlimited bookings",
        "Advanced scheduling",
        "Invoice generation",
        "SMS & WhatsApp alerts",
        "Reviews & ratings",
        "Staff management",
        "Analytics dashboard"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Everything in Professional",
        "Multiple locations",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom integrations"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              <Link to="/discover" className="text-gray-600 hover:text-royal-red transition-colors">
                Discover Businesses
              </Link>
              <Link to="/demo" className="text-gray-600 hover:text-royal-red transition-colors">
                Demo
              </Link>
              <Link to="/safety" className="text-gray-600 hover:text-royal-red transition-colors">
                Safety
              </Link>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-royal-red hover:bg-royal-red/90 text-white"
              >
                Get Started
              </Button>
            </div>

            <div className="md:hidden">
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white"
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
              🚀 Global Business Management Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your Business with 
              <span className="text-royal-red"> Boinvit</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete booking and invoice management solution for businesses worldwide. 
              Manage salons, gyms, clinics, transport services, and hospitality businesses globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                onClick={() => navigate('/demo')}
                className="border-royal-red text-royal-red hover:bg-royal-red hover:text-white px-8 py-3 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Partners Slider */}
      <GlobalPartnersSlider />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From appointment scheduling to international payment processing, 
              we've got all your business needs covered worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-royal-red mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
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
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers have to say about their experience with Boinvit
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

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'border-royal-red' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-royal-red text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-royal-red">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-royal-red hover:bg-royal-red/90 text-white' : 'border-royal-red text-royal-red hover:bg-royal-red hover:text-white'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-royal-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Boinvit to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-royal-red hover:bg-gray-50 px-8 py-3 text-lg"
            >
              Start Your Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/discover')}
              className="border-white text-white hover:bg-white hover:text-royal-red px-8 py-3 text-lg"
            >
              Discover Businesses
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
                Global business management platform for modern entrepreneurs worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link to="/discover" className="hover:text-white">Discover</Link></li>
                <li><Link to="/safety" className="hover:text-white">Safety</Link></li>
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
                  +254 700 000 000
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Boinvit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
