
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleBusinessSetup = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessData.name,
          description: businessData.description,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Update user profile to mark as onboarded
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email || '',
        });

      if (profileError) throw profileError;

      toast.success('Business setup completed!');
      setStep(2);
    } catch (error) {
      console.error('Error setting up business:', error);
      toast.error('Failed to setup business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = () => {
    toast.success('Welcome to your dashboard!');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Boinvit!</CardTitle>
            <CardDescription>
              Let's set up your business profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessData.name}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your business name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Input
                      id="businessDescription"
                      value={businessData.description}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your business"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessAddress">Address</Label>
                    <Input
                      id="businessAddress"
                      value={businessData.address}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Business address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessPhone">Phone</Label>
                    <Input
                      id="businessPhone"
                      value={businessData.phone}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Business phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessEmail">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessData.email}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Business email"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleBusinessSetup}
                  disabled={loading || !businessData.name}
                  className="w-full"
                >
                  {loading ? 'Setting up...' : 'Setup Business'}
                </Button>
              </>
            )}
            
            {step === 2 && (
              <div className="text-center space-y-4">
                <div className="text-green-500 text-4xl">✓</div>
                <h3 className="text-lg font-medium">Setup Complete!</h3>
                <p className="text-gray-600">
                  Your business has been set up successfully. You can now start managing your bookings and services.
                </p>
                <Button onClick={completeOnboarding} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
