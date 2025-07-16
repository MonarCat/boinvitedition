import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  UserCheck,
  Eye,
  Heart,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const SafetyPage = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Businesses",
      description: "All businesses go through our verification process to ensure legitimacy and quality standards."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Your payment information is protected with bank-grade encryption and secure processing."
    },
    {
      icon: UserCheck,
      title: "Identity Verification",
      description: "Service providers undergo identity verification to ensure customer safety and trust."
    },
    {
      icon: Eye,
      title: "Transparent Reviews",
      description: "Read genuine reviews from real customers to make informed booking decisions."
    }
  ];

  const guidelines = [
    "Book only through verified businesses on our platform",
    "Read reviews and check business ratings before booking",
    "Meet service providers in public or business locations",
    "Report any suspicious activity to our support team",
    "Keep all communication and payments within the platform",
    "Trust your instincts - if something feels wrong, contact us"
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
              <h1 className="text-xl font-semibold">Safety & Trust</h1>
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
            <Shield className="h-4 w-4 mr-2" />
            Your Safety is Our Priority
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Safe, Secure & Trusted Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're committed to creating a safe environment where customers and businesses can connect with confidence.
          </p>
        </div>
      </div>

      {/* Safety Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How We Keep You Safe
            </h2>
            <p className="text-lg text-muted-foreground">
              Multiple layers of protection for your peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
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

      {/* Safety Guidelines */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Safety Guidelines
              </h2>
              <p className="text-lg text-muted-foreground">
                Follow these best practices to ensure a safe experience
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{guideline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Help or Want to Report Something?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our support team is available 24/7 to help you with any safety concerns or questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Contact Support
              </Button>
              <Button size="lg" variant="outline">
                Report an Issue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;