
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, QrCode, Calendar, Users, Smartphone, Star, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

const DemoVideo = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [showDemoModal, setShowDemoModal] = useState(false);

  const demoSections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      duration: '2:30',
      description: 'See how BookFlow transforms your business',
      icon: <Play className="h-5 w-5" />,
      features: [
        'Dashboard walkthrough',
        'Key features overview',
        'Business setup process',
        'Mobile-first design'
      ]
    },
    {
      id: 'qr-booking',
      title: 'QR Code Booking',
      duration: '1:45',
      description: 'Watch customers book in seconds',
      icon: <QrCode className="h-5 w-5" />,
      features: [
        'Instant QR code generation',
        'Customer booking flow',
        'Real-time availability',
        'Automatic client creation'
      ]
    },
    {
      id: 'management',
      title: 'Business Management',
      duration: '3:15',
      description: 'Manage bookings, clients & services',
      icon: <Calendar className="h-5 w-5" />,
      features: [
        'Booking management',
        'Client tracking',
        'Service configuration',
        'Staff scheduling'
      ]
    },
    {
      id: 'mobile',
      title: 'Mobile Experience',
      duration: '2:00',
      description: 'Manage your business on the go',
      icon: <Smartphone className="h-5 w-5" />,
      features: [
        'Mobile-optimized interface',
        'Push notifications',
        'Offline capabilities',
        'Cross-platform sync'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Elegant Spa & Wellness',
      content: 'BookFlow increased our bookings by 300% in just 2 months. The QR code system is revolutionary!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      business: 'Urban Barber Shop',
      content: 'No more phone calls or missed appointments. Our clients love how easy it is to book.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      business: 'Fitness Personal Training',
      content: 'The real-time updates and client management features have streamlined our entire operation.',
      rating: 5
    }
  ];

  // Button Interactivity handlers
  const handlePlay = () => {
    toast.info('Playing demo video...');
    setShowDemoModal(true);
  };
  const handleFullScreen = () => {
    toast('Full screen mode not available in demo.');
  };
  const handleDownload = () => {
    toast.success('Demo video "downloaded" (this is a preview action).');
  };
  const handleStartTrial = () => {
    toast('Redirecting to Free Trial signup (demo preview).');
  };
  const handleScheduleDemo = () => {
    toast('Schedule demo call feature coming soon!');
  };

  const currentSection = demoSections.find(s => s.id === activeDemo);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Demo Modal (fake video preview) */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative flex flex-col items-center p-8">
            <button
              title="Close"
              className="absolute top-2 right-2 p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              onClick={() => setShowDemoModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 font-bold text-xl text-gray-900">{currentSection?.title} — Demo Preview</div>
            <div className="aspect-video bg-black text-white flex items-center justify-center rounded-md relative w-full mb-4">
              <Play className="h-10 w-10 opacity-60" />
              <span className="absolute bottom-2 right-2 text-xs bg-black/50 px-2 py-1 rounded">
                {currentSection?.duration}
              </span>
            </div>
            <div className="text-gray-700 mb-4">
              <p>This is a demo video placeholder for "{currentSection?.title}".</p>
              <p className="text-gray-500 text-xs mt-2">For a real video, upgrade your plan.</p>
            </div>
            <Button className="bg-blue-600 text-white" onClick={() => setShowDemoModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800">
          Interactive Demo
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          See BookFlow in Action
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover how thousands of businesses are transforming their booking process 
          with our smart, QR-powered platform.
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoSections.map((section) => (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeDemo === section.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
            onClick={() => setActiveDemo(section.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                {section.icon}
                <Badge variant="outline">{section.duration}</Badge>
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Demo Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="text-center text-white z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {currentSection?.title}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {currentSection?.description}
                  </p>
                  <Button
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={handlePlay}
                  >
                    Watch Demo
                  </Button>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Clock className="h-4 w-4" />
                    Live Demo Running
                  </div>
                </div>
              </div>
              
              {/* Demo Controls */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button size="sm" onClick={handlePlay}>
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <span className="text-sm text-gray-600">
                      {currentSection?.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleFullScreen}>
                      Full Screen
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentSection?.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Setup Time</span>
                <Badge variant="outline">5 minutes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Booking Increase</span>
                <Badge className="bg-green-100 text-green-800">+300%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile Optimized</span>
                <Badge className="bg-blue-100 text-blue-800">100%</Badge>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleStartTrial}>
            Start Your Free Trial
          </Button>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Loved by 10,000+ Businesses
          </h2>
          <p className="text-gray-600">
            See what our customers are saying about BookFlow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.business}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-6 text-white/90">
            Join thousands of businesses already using BookFlow to grow their revenue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={handleStartTrial}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleScheduleDemo}>
              Schedule Demo Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoVideo;

