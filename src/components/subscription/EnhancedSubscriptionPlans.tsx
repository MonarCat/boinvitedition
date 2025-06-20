
import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { EnhancedPaymentFlow } from '@/components/payment/EnhancedPaymentFlow';
import { BillingIntervalSelector } from './BillingIntervalSelector';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { subscriptionPlans, SubscriptionPlan } from './SubscriptionPlansData';

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId?: string;
  customerEmail?: string;
  onSelectPlan: (planId: string, interval: string, amount: number) => void;
  isLoading?: boolean;
}

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  currentPlan,
  businessId,
  customerEmail,
  onSelectPlan,
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const [selectedInterval, setSelectedInterval] = React.useState<string>('monthly');
  const [showPayment, setShowPayment] = React.useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan, interval: string) => {
    setSelectedPlan(plan);
    setSelectedInterval(interval);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan.id, selectedInterval, selectedPlan.pricing[selectedInterval as keyof typeof selectedPlan.pricing]);
      setShowPayment(false);
      setSelectedPlan(null);
    }
  };

  if (showPayment && selectedPlan) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="mb-4"
        >
          ← Back to Plans
        </Button>
        <EnhancedPaymentFlow
          planType={selectedPlan.name}
          amount={selectedPlan.pricing[selectedInterval as keyof typeof selectedPlan.pricing]}
          businessId={businessId}
          customerEmail={customerEmail}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BillingIntervalSelector defaultValue="monthly">
        {(['monthly', 'quarterly', 'biannual', 'annual', 'twoYear', 'threeYear'] as const).map((interval) => (
          <TabsContent key={interval} value={interval} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {subscriptionPlans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  interval={interval}
                  currentPlan={currentPlan}
                  isLoading={isLoading}
                  onSelectPlan={handlePlanSelect}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </BillingIntervalSelector>
    </div>
  );
};
