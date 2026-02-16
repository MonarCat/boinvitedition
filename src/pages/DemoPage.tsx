import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, BarChart3, ArrowLeft, Star, CheckCircle, ClipboardList } from 'lucide-react';

const DemoPage = () => {
  const navigate = useNavigate();

  const demoFeatures = [
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Smart Meeting Scheduling',
      description: 'Create and schedule internal meetings with automated conflict detection. The system suggests optimal time slots based on employee availability and department schedules.',
      screenshots: [
        'Meeting creation interface with calendar view',
        'Conflict detection and resolution suggestions',
        'Time slot optimization based on availability'
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Controlled Invitations',
      description: 'Send targeted invitations to specific employees or departments. No more WhatsApp group chaos - maintain control over who receives meeting notifications.',
      screenshots: [
        'Department and employee selection interface',
        'Invitation preview and customization',
        'RSVP tracking dashboard'
      ]
    },
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: 'Attendance Tracking',
      description: 'Real-time attendance marking with QR code check-ins. Track who attended, who missed, and generate comprehensive reports for compliance.',
      screenshots: [
        'QR code check-in system',
        'Real-time attendance dashboard',
        'Attendance history per employee'
      ]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: 'Automated Reports',
      description: 'Generate attendance reports, training completion records, and compliance documentation with a single click. Export to Excel or PDF for management.',
      screenshots: [
        'Report generation interface',
        'Customizable report templates',
        'Export options (Excel, PDF)'
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
            Discover how Boinvit transforms internal meeting coordination for HR and Admin teams. 
            No more WhatsApp chaos or Excel tracking - everything in one platform.
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
              See how each feature solves real HR and Admin challenges
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
                Ready to Transform Your Meeting Coordination?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join 50+ organizations using Boinvit to manage internal meetings and training sessions
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