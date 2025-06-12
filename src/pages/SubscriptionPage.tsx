
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaymentSuccess } from '@/components/payment/PaymentSuccess';
import { LoadingSpinner } from '@/components/subscription/LoadingSpinner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { MobilePaymentNotice } from '@/components/subscription/MobilePaymentNotice';
import { ContactSalesSection } from '@/components/subscription/ContactSalesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock subscription plans data since the table doesn't exist
  const subscriptionPlans = [
    {
      id: '1',
      name: 'Free',
      description: 'Basic features for small businesses',
      price_monthly: 0,
      max_bookings: 50,
      max_services: 3,
      features: ['Basic booking management', 'Email notifications', 'Customer management'],
      is_active: true
    },
    {
      id: '2', 
      name: 'Pro',
      description: 'Advanced features for growing businesses',
      price_monthly: 29,
      max_bookings: 500,
      max_services: 20,
      features: ['Advanced booking management', 'SMS notifications', 'Analytics', 'Custom branding'],
      is_active: true
    },
    {
      id: '3',
      name: 'Enterprise', 
      description: 'Full features for large businesses',
      price_monthly: 99,
      max_bookings: -1,
      max_services: -1,
      features: ['Unlimited bookings', 'Priority support', 'Advanced analytics', 'API access'],
      is_active: true
    }
  ];

  // Mock user business data
  const userBusiness = {
    id: 'mock-business-id',
    subscription_plan: 'Free',
    subscription_status: 'active'
  };

  const handleUpgrade = (plan: any) => {
    if (plan.price_monthly === 0) {
      toast.info('You are already on the free plan');
      return;
    }
    
    toast.info('Subscription upgrade functionality will be available once payment integration is complete');
  };

  const handleContinueAfterSuccess = () => {
    setShowSuccess(false);
    toast.success('Subscription activated successfully!');
  };

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <PaymentSuccess onContinue={handleContinueAfterSuccess} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <SubscriptionHeader userBusiness={userBusiness} />
        <MobilePaymentNotice />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.name === 'Pro' ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.name === 'Pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
                  {plan.price_monthly > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleUpgrade(plan)}
                  className="w-full"
                  variant={plan.name === userBusiness.subscription_plan ? "outline" : "default"}
                  disabled={plan.name === userBusiness.subscription_plan}
                >
                  {plan.name === userBusiness.subscription_plan ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <ContactSalesSection />
      </div>
    </DashboardLayout>
  );
}
