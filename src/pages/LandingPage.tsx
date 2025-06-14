import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Smartphone,
  Globe,
  CreditCard,
  MapPin,
  LogIn
} from 'lucide-react';
import { PartnersSlider } from '@/components/landing/PartnersSlider';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
                alt="Boinvit Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Boinvit</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/discover">
                <Button variant="outline" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Find Services
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline">Try Demo</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your Business
            <span className="text-royal-red block">Bookings & Payments</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From salons to hotels, transport to medical services - manage appointments, accept payments, and grow your business with our all-in-one booking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <MapPin className="mr-2 h-5 w-5" />
                Discover Local Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Slider */}
      <PartnersSlider />

      {/* Map Discovery Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Local Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find barbershops, salons, hotels, transport services, medical care, and more in your area. 
              Book appointments directly and see ratings from other customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { name: 'Hotels & Hospitality', icon: '🏨', count: '200+' },
              { name: 'Transport Services', icon: '🚌', count: '300+' },
              { name: 'Barbershops & Salons', icon: '✂️', count: '150+' },
              { name: 'Medical & Dental', icon: '🏥', count: '95+' },
              { name: 'Massage & Spa', icon: '💆‍♀️', count: '80+' },
              { name: 'Fitness & Gyms', icon: '💪', count: '120+' },
              { name: 'Event Planning', icon: '🎉', count: '45+' },
              { name: 'Beauty & Wellness', icon: '✨', count: '110+' }
            ].map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <Badge variant="secondary">{category.count} businesses</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/discover">
              <Button size="lg" className="bg-royal-red hover:bg-royal-red/90">
                <MapPin className="mr-2 h-5 w-5" />
                Explore Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empower your business with our comprehensive suite of features designed to streamline operations and enhance customer experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Calendar className="h-5 w-5 text-royal-red" />
                  Online Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Let clients book appointments 24/7 from any device.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Clock className="h-5 w-5 text-royal-red" />
                  Automated Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reduce no-shows with automated SMS and email reminders.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Users className="h-5 w-5 text-royal-red" />
                  Client Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Keep track of client history, preferences, and contact information.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Star className="h-5 w-5 text-royal-red" />
                  Reviews and Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Collect and showcase client reviews to build trust.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <CheckCircle className="h-5 w-5 text-royal-red" />
                  Business Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get verified to show customers you're a trusted business.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Smartphone className="h-5 w-5 text-royal-red" />
                  Mobile App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage your business on the go with our mobile app.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. Start with a free trial and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-900 font-bold text-4xl">$0<span className="text-sm text-gray-500">/month</span></div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Up to 50 bookings per month</li>
                  <li>Basic online booking features</li>
                  <li>Limited customer support</li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-royal-red border-solid shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-900 font-bold text-4xl">$29<span className="text-sm text-gray-500">/month</span></div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Unlimited bookings</li>
                  <li>Advanced features & integrations</li>
                  <li>Priority customer support</li>
                </ul>
                <Button className="w-full bg-royal-red hover:bg-royal-red/90 text-white">Upgrade to Pro</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <CardDescription>Custom solutions for large teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-900 font-bold text-4xl">Contact Us</div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Customized features</li>
                  <li>Dedicated account manager</li>
                  <li>24/7 premium support</li>
                </ul>
                <Button className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-royal-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white opacity-80 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses already using Boinvit to streamline their bookings, manage clients, and grow their revenue.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-royal-red hover:bg-gray-100">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Boinvit</h4>
              <p className="text-gray-400">
                Boinvit is the all-in-one solution for managing your business, from bookings to payments.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="hover:text-gray-300">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-gray-300">Cookie Policy</Link></li>
                <li><Link to="/safety" className="hover:text-gray-300">Safety Tips</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-gray-300">Online Booking</a></li>
                <li><a href="#" className="hover:text-gray-300">Client Management</a></li>
                <li><a href="#" className="hover:text-gray-300">Payment Processing</a></li>
                <li><a href="#" className="hover:text-gray-300">Automated Reminders</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Email: support@boinvit.com<br />
                Phone: +1 (555) 123-4567
              </p>
              <div className="mt-4 flex gap-4">
                <a href="#" className="hover:text-gray-300"><Globe className="h-5 w-5" /></a>
                <a href="#" className="hover:text-gray-300"><CreditCard className="h-5 w-5" /></a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} Boinvit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
