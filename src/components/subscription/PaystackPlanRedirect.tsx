
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PaystackPlanRedirectProps {
  planId: string;
  planName: string;
  price: number;
  isCurrentPlan?: boolean;
  disabled?: boolean;
  className?: string;
}

const PAYSTACK_PLAN_URLS = {
  trial: 'https://paystack.shop/pay/4qwq0f-lo6',
  starter: 'https://paystack.shop/pay/starter-plan-1020',
  medium: 'https://paystack.shop/pay/business-plan-2900',
  premium: 'https://paystack.shop/pay/enterprise-plan-9900'
};

export const PaystackPlanRedirect: React.FC<PaystackPlanRedirectProps> = ({
  planId,
  planName,
  price,
  isCurrentPlan = false,
  disabled = false,
  className = ''
}) => {
  const handlePaystackRedirect = () => {
    const paymentUrl = PAYSTACK_PLAN_URLS[planId as keyof typeof PAYSTACK_PLAN_URLS];
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  if (isCurrentPlan) {
    return (
      <Button disabled variant="outline" className={`w-full ${className}`}>
        Current Plan
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePaystackRedirect}
      disabled={disabled}
      className={`w-full ${className}`}
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Pay with Paystack
    </Button>
  );
};
