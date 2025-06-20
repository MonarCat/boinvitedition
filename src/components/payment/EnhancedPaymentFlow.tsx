
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { PaystackPayment, loadPaystackScript } from './PaystackPayment';
import { PaymentInfoCard } from './PaymentInfoCard';
import { InitializationFeeInfo } from './InitializationFeeInfo';
import { AvailablePaymentMethods } from './AvailablePaymentMethods';
import { EmailInputField } from './EmailInputField';
import { PaymentStatusMessages } from './PaymentStatusMessages';
import { SecurityInfo } from './SecurityInfo';

interface EnhancedPaymentFlowProps {
  planType: string;
  amount: number;
  businessId?: string;
  customerEmail?: string;
  onSuccess?: (reference: string) => void;
}

export const EnhancedPaymentFlow: React.FC<EnhancedPaymentFlowProps> = ({
  planType,
  amount,
  businessId,
  customerEmail = '',
  onSuccess
}) => {
  const [email, setEmail] = useState(customerEmail);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Initialize Paystack script on component mount
  React.useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  const handlePaystackSuccess = (reference: string) => {
    setPaymentStatus('success');
    toast.success('Payment successful!');
    onSuccess?.(reference);
  };

  const isInitializationFee = amount === 10;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <Card>
        <PaymentInfoCard
          planType={planType}
          amount={amount}
          isInitializationFee={isInitializationFee}
        />
        <CardContent className="space-y-6">
          {isInitializationFee && <InitializationFeeInfo />}

          <AvailablePaymentMethods />

          <EmailInputField
            email={email}
            onEmailChange={setEmail}
          />

          <PaystackPayment
            amount={amount}
            email={email}
            currency="KES"
            onSuccess={handlePaystackSuccess}
            metadata={{
              plan_type: planType,
              business_id: businessId,
              payment_method: 'paystack_popup',
              is_initialization: isInitializationFee
            }}
            disabled={!email.trim() || paymentStatus === 'processing'}
          />

          <PaymentStatusMessages paymentStatus={paymentStatus} />

          <SecurityInfo />
        </CardContent>
      </Card>
    </div>
  );
};
