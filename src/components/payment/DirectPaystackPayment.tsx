import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { PaymentAmountDisplay } from './PaymentAmountDisplay';
import { ClientDetailsForm } from './ClientDetailsForm';
import { PaymentMethodsInfo } from './PaymentMethodsInfo';
import { PaymentButton } from './PaymentButton';
import { PaymentSecurityNotice } from './PaymentSecurityNotice';
import { usePaystackPayment } from '@/hooks/usePaystackPayment';
import { loadPaystackScript } from './PaystackScriptLoader';
import { toast } from 'sonner';

interface DirectPaystackPaymentProps {
  amount: number;
  currency: string;
  email?: string;
  metadata: {
    payment_type: 'client_to_business' | 'subscription';
    business_id?: string;
    booking_id?: string;
    plan_type?: string;
    business_name?: string;
    customer_name?: string;
    service_id?: string;
    service_name?: string;
    staff_id?: string;
    appointment_date?: string;
    appointment_time?: string;
    customer_phone?: string;
  };
  onSuccess: (reference: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  title?: string;
  description?: string;
  showClientDetails?: boolean;
}

export const DirectPaystackPayment: React.FC<DirectPaystackPaymentProps> = ({
  amount,
  currency,
  email: initialEmail = '',
  metadata,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  title = 'Complete Payment',
  description = 'Secure payment powered by Paystack',
  showClientDetails = false
}) => {
  const [clientDetails, setClientDetails] = useState({
    email: initialEmail,
    phone: '',
    name: ''
  });

  const { isProcessing, processPayment } = usePaystackPayment();

  useEffect(() => {
    // Preload Paystack script on component mount
    const preloadScript = async () => {
      try {
        await loadPaystackScript();
        console.log('DirectPaystackPayment: Paystack script loaded');
      } catch (error) {
        console.error('DirectPaystackPayment: Failed to load Paystack script:', error);
        toast.error('Payment system could not be loaded. Please refresh the page and try again.');
      }
    };
    
    preloadScript();
  }, []);

  const handlePayment = () => {
    processPayment(
      amount,
      currency,
      initialEmail,
      metadata,
      clientDetails,
      showClientDetails,
      onSuccess,
      onError
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            {title}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <PaymentAmountDisplay 
            amount={amount} 
            currency={currency} 
            paymentType={metadata.payment_type} 
          />

          <ClientDetailsForm 
            clientDetails={clientDetails}
            setClientDetails={setClientDetails}
            showClientDetails={showClientDetails}
          />

          <PaymentMethodsInfo />

          <PaymentButton 
            onPayment={handlePayment}
            isProcessing={isProcessing}
            amount={amount}
            currency={currency}
            buttonText={buttonText}
          />

          <PaymentSecurityNotice />
        </CardContent>
      </Card>
    </div>
  );
};

// No need to re-export since we're importing directly in components that need it
