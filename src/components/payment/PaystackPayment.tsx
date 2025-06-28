
import React, { useEffect } from 'react';
import { DirectPaystackPayment } from './DirectPaystackPayment';
import { loadPaystackScript } from './PaystackScriptLoader';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  currency?: string;
  onSuccess: (reference: string) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
  className?: string;
}

export const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  email,
  currency = 'KES',
  onSuccess,
  onError,
  metadata = {},
  disabled = false,
  className = ''
}) => {
  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  return (
    <div className={className}>
      <DirectPaystackPayment
        amount={amount}
        currency={currency}
        email={email}
        metadata={{
          payment_type: metadata.booking_id ? 'client_to_business' : 'subscription',
          ...metadata
        }}
        onSuccess={onSuccess}
        onError={onError}
        title="Complete Payment"
        description="Secure payment powered by Paystack"
        showClientDetails={false}
        buttonText="Pay"
      />
    </div>
  );
};

// Export the loadPaystackScript function for backward compatibility
export { loadPaystackScript };
