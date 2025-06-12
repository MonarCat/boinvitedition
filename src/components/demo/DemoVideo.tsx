
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LogoAnimation } from './LogoAnimation';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  component: React.ReactNode;
}

export const DemoVideo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLogo, setShowLogo] = useState(true);

  const demoSteps: DemoStep[] = [
    {
      id: 'intro',
      title: 'Welcome to Boinvit',
      description: 'Your complete solution for Booking, Invoicing, and Ticketing',
      duration: 4000,
      component: (
        <LogoAnimation 
          onComplete={() => {
            setShowLogo(false);
            setCurrentStep(1);
          }}
        />
      )
    },
    {
      id: 'signup',
      title: 'Easy Sign Up Process',
      description: 'Get started in minutes with our simple registration',
      duration: 6000,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
              alt="Boinvit Logo" 
              className="h-12 w-auto mx-auto mb-4 animate-fade-in"
            />
            <h2 className="text-2xl font-bold animate-fade-in">Sign Up Demo</h2>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                    <span className="text-gray-500">demo@example.com</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                    <span className="text-gray-500">••••••••</span>
                  </div>
                </div>
                <Button className="w-full bg-royal-red hover:bg-royal-red/90 animate-fade-in">
                  Create Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'business-setup',
      title: 'Business Profile Setup',
      description: 'Configure your business details and preferences',
      duration: 8000,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
              alt="Boinvit Logo" 
              className="h-12 w-auto mx-auto mb-4 animate-fade-in"
            />
            <h2 className="text-2xl font-bold animate-fade-in">Business Setup Demo</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Setup Your Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">Demo Salon & Spa</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Type</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">Beauty & Wellness</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">+1 (555) 123-4567</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">New York, NY</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-royal-red hover:bg-royal-red/90 animate-fade-in">
                  Complete Setup
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'clients',
      title: 'Managing Clients',
      description: 'Add and organize your client database',
      duration: 6000,
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
              alt="Boinvit Logo" 
              className="h-12 w-auto mx-auto mb-4 animate-fade-in"
            />
            <h2 className="text-2xl font-bold animate-fade-in">Client Management Demo</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">Sarah</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">Johnson</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">sarah@example.com</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 animate-pulse">
                      <span className="text-gray-500">+1 (555) 987-6543</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-royal-red hover:bg-royal-red/90 animate-fade-in">
                  Add Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentStep === 0 && !showLogo) {
      setShowLogo(true);
      setCurrentStep(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setShowLogo(true);
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Demo Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={isPlaying ? handlePause : handlePlay} size="sm">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={handleRestart} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      {/* Demo Progress */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {demoSteps.length}
            </span>
            <span className="text-sm text-gray-600">
              {showLogo ? 'Introduction' : demoSteps[currentStep]?.title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-royal-red h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6">
        {showLogo ? (
          <LogoAnimation 
            onComplete={() => {
              setShowLogo(false);
              setCurrentStep(1);
            }}
          />
        ) : (
          demoSteps[currentStep]?.component
        )}
      </div>
    </div>
  );
};
