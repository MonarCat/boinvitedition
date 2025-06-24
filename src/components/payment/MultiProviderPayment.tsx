
import React, { useEffect } from 'react';
import { DirectPaystackPayment, loadPaystackScript } from './DirectPaystackPayment';

interface MultiProviderPaymentProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  businessId: string;
  customerEmail: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export const MultiProviderPayment: React.FC<MultiProviderPaymentProps> = ({
  plan,
  businessId,
  customerEmail,
  onSuccess,
  onError
}) => {
  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  return (
    <DirectPaystackPayment
      amount={plan.price}
      currency={plan.currency}
      email={customerEmail}
      metadata={{
        payment_type: 'subscription',
        business_id: businessId,
        plan_type: plan.id
      }}
      onSuccess={onSuccess}
      onError={onError}
      title={`Subscribe to ${plan.name}`}
      description="Secure subscription payment powered by Paystack"
      showClientDetails={false}
      buttonText="Subscribe to"
    />
  );
};
