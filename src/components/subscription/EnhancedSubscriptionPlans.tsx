import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
  icon: React.ElementType;
  color: string;
  staffLimit?: number | null;
  bookingsLimit?: number | null;
}

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId: string;
  onSelectPlan?: (planId: string, interval: string, amount: number) => void;
  isLoading: boolean;
}

export const EnhancedSubscriptionPlans = ({
  currentPlan,
  businessId,
  onSelectPlan,
  isLoading
}: EnhancedSubscriptionPlansProps) => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'payg',
      name: 'Pay As You Go',
      price: 0,
      currency: 'KES',
      interval: 'commission',
      description: 'Only pay when you get paid - 5% commission',
      icon: TrendingUp,
      color: 'red',
      recommended: true,
      popular: true,
      staffLimit: null,
      bookingsLimit: null,
      features: [
        'No monthly subscription',
        'Only 5% commission on payments received',
        'Unlimited staff members',
        'Unlimited bookings',
        'Full platform access',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'White-label options',
        'API access',
        '24/7 priority support'
      ]
    }
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (processingPlan || !onSelectPlan) return;
    
    setProcessingPlan(plan.id);
    
    try {
      // Since Pay As You Go is the default revenue model, we don't need to create a subscription
      const toastId = toast.loading('Activating Pay As You Go plan...');
      
      // Using a setTimeout to simulate the activation process
      setTimeout(() => {
        toast.dismiss(toastId);
        toast.success('Pay As You Go plan activated successfully!', {
          duration: 5000,
          style: {
            background: '#DC2626',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
      }, 1000);
      
    } catch (error) {
      console.error('Plan activation error:', error);
      toast.error('Failed to activate plan. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Plans Grid - Only showing PAYG plan */}
      <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isProcessing = processingPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className="relative border-4 border-red-500 shadow-2xl transform hover:scale-105 bg-gradient-to-br from-red-50 to-white transition-all duration-200 hover:shadow-lg"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-red-600 text-white px-6 py-2 font-bold shadow-lg text-lg">
                  <Star className="w-4 h-4 mr-1" />
                  NO MONTHLY FEE
                </Badge>
              </div>

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-red-600" />
                </div>
                
                <CardTitle className="text-xl font-bold text-red-700">{plan.name}</CardTitle>
                <p className="text-sm text-red-600 font-medium">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-red-600">
                    5% commission only
                  </div>
                  <div className="text-lg text-red-600 font-bold mt-1">
                    No monthly subscription
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan || isProcessing || isLoading}
                  className="w-full text-lg font-bold py-3 transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-xl transform hover:scale-105"
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : isProcessing 
                    ? 'Processing...' 
                    : '🚀 START PAY AS YOU GO'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods Info */}
      <div className="text-center bg-gray-50 rounded-lg p-6">
        <p className="text-sm text-gray-600">
          <strong>Simple Pricing:</strong> No monthly fees, just a 5% commission on payments you receive through the platform.
        </p>
      </div>
    </div>
  );
};
