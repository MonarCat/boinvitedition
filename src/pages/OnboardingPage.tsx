import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Users, Target, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees', description: 'Small team' },
  { value: '51-100', label: '51-100 employees', description: 'Growing organization' },
  { value: '101-250', label: '101-250 employees', description: 'Mid-sized company' },
  { value: '251-500', label: '251-500 employees', description: 'Large organization' },
  { value: '500+', label: '500+ employees', description: 'Enterprise' },
];

const USE_CASES = [
  { value: 'trainings', label: 'Staff Trainings', description: 'Coordinate learning sessions' },
  { value: 'town_halls', label: 'Town Halls', description: 'Company-wide meetings' },
  { value: 'compliance', label: 'Compliance Sessions', description: 'Mandatory regulatory meetings' },
  { value: 'onboarding', label: 'Employee Onboarding', description: 'New hire orientation' },
  { value: 'workshops', label: 'Workshops', description: 'Interactive skill-building' },
  { value: 'team_meetings', label: 'Team Meetings', description: 'Departmental coordination' },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [companySize, setCompanySize] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setBusinessId(data.id);
        if (data.onboarding_completed) {
          navigate('/app/dashboard');
        }
      }
    };
    
    fetchBusiness();
  }, [user, navigate]);

  const handleUseCaseToggle = (value: string) => {
    setUseCases(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!businessId) {
      toast.error('No business found. Please complete business setup first.');
      return;
    }

    if (!companySize) {
      toast.error('Please select your company size');
      return;
    }

    if (useCases.length === 0) {
      toast.error('Please select at least one use case');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          company_size: companySize,
          primary_use_cases: useCases,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', businessId);

      if (error) throw error;

      toast.success('Onboarding complete! Welcome to Boinvit.');
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
                alt="Boinvit Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">Boinvit</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Boinvit</CardTitle>
          <CardDescription>
            Help us personalize your experience by answering a few quick questions
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Company Size</h3>
                  <p className="text-sm text-muted-foreground">How many employees are in your organization?</p>
                </div>
              </div>

              <RadioGroup value={companySize} onValueChange={setCompanySize} className="space-y-3">
                {COMPANY_SIZES.map((size) => (
                  <div key={size.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={size.value} id={size.value} />
                    <Label 
                      htmlFor={size.value} 
                      className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{size.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">— {size.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!companySize}
                className="w-full mt-4"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Primary Use Cases</h3>
                  <p className="text-sm text-muted-foreground">What types of meetings will you manage? (Select all that apply)</p>
                </div>
              </div>

              <div className="grid gap-3">
                {USE_CASES.map((useCase) => (
                  <div 
                    key={useCase.value}
                    onClick={() => handleUseCaseToggle(useCase.value)}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      useCases.includes(useCase.value) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox 
                      checked={useCases.includes(useCase.value)} 
                      onCheckedChange={() => handleUseCaseToggle(useCase.value)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{useCase.label}</p>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                    {useCases.includes(useCase.value) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={useCases.length === 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
