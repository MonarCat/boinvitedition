
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from './SubscriptionPlansData';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  interval: string;
  currentPlan?: string;
  isLoading: boolean;
  onSelectPlan: (plan: SubscriptionPlan, interval: string) => void;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  interval,
  currentPlan,
  isLoading,
  onSelectPlan
}) => {
  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'monthly': return '/month';
      case 'quarterly': return '/3 months';
      case 'biannual': return '/6 months';
      case 'annual': return '/year';
      case 'twoYear': return '/2 years';
      case 'threeYear': return '/3 years';
      default: return '/month';
    }
  };

  const getButtonText = (planId: string) => {
    switch (planId) {
      case 'trial': return 'Start Free Trial';
      case 'payasyougo': return 'Activate Pay-As-You-Go';
      default: return 'Choose Plan';
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-lg ${
        plan.popular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : 'hover:scale-102'
      } ${currentPlan === plan.id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white px-4 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      {currentPlan === plan.id && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1">
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4 pt-6">
        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
          {plan.icon}
        </div>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            KES {plan.pricing[interval as keyof typeof plan.pricing].toLocaleString()}
            <span className="text-sm font-normal text-gray-600">
              {getIntervalLabel(interval)}
            </span>
          </div>
          {plan.discounts[interval as keyof typeof plan.discounts] > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save {plan.discounts[interval as keyof typeof plan.discounts]}%
            </Badge>
          )}
          {plan.pricing[interval as keyof typeof plan.pricing] === 10 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              One-time Setup Fee
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm text-center">{plan.description}</p>
        
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4">
          {currentPlan === plan.id ? (
            <Button disabled className="w-full bg-green-600">
              Current Plan
            </Button>
          ) : (
            <Button 
              onClick={() => onSelectPlan(plan, interval)}
              disabled={isLoading}
              className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {getButtonText(plan.id)}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
