import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';

const DiscoverPage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-semibold">Discover Businesses</h1>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Find Amazing Businesses
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover and book services from thousands of businesses worldwide
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="text-center">
              <Badge className="mx-auto mb-4 w-fit">Coming Soon</Badge>
              <CardTitle className="text-2xl">Business Discovery Platform</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We're building an amazing discovery experience where you can:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Smart Search</h4>
                    <p className="text-sm text-muted-foreground">Find businesses by location, service, or specialty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Location-Based</h4>
                    <p className="text-sm text-muted-foreground">Discover businesses near you or in any city</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Reviews & Ratings</h4>
                    <p className="text-sm text-muted-foreground">See what other customers are saying</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Filter className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Advanced Filters</h4>
                    <p className="text-sm text-muted-foreground">Filter by price, availability, and more</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={() => navigate('/auth')} className="w-full sm:w-auto">
                  Join the Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;