
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMetadata {
  payment_type: 'client_to_business' | 'subscription';
  business_id?: string;
  booking_id?: string;
  plan_type?: string;
  business_name?: string;
  customer_name?: string;
}

interface ClientDetails {
  email: string;
  phone: string;
  name: string;
}

export const usePaystackPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInputs = (showClientDetails: boolean, clientDetails: ClientDetails) => {
    if (showClientDetails) {
      if (!clientDetails.email) {
        toast.error('Please provide your email address');
        return false;
      }
      if (!clientDetails.phone) {
        toast.error('Please provide your phone number');
        return false;
      }
    }
    return true;
  };

  const generateReference = (metadata: PaymentMetadata) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const prefix = metadata.payment_type === 'subscription' ? 'SUB' : 'CBP';
    return `${prefix}_${timestamp}_${randomId}`;
  };

  const logTransaction = async (
    reference: string, 
    status: string, 
    amount: number, 
    currency: string, 
    metadata: PaymentMetadata, 
    clientDetails: ClientDetails
  ) => {
    try {
      if (metadata.payment_type === 'client_to_business' && metadata.business_id) {
        // Calculate platform fee (5%)
        const platformFee = amount * 0.05;
        const businessAmount = amount - platformFee;

        await supabase
          .from('client_business_transactions')
          .insert({
            client_email: clientDetails.email,
            client_phone: clientDetails.phone,
            business_id: metadata.business_id,
            booking_id: metadata.booking_id,
            amount: amount,
            platform_fee: platformFee,
            business_amount: businessAmount,
            payment_reference: reference,
            paystack_reference: reference,
            payment_method: 'paystack',
            status: status
          });
      }
      
      // Log general payment transaction
      await supabase
        .from('payment_transactions')
        .insert({
          business_id: metadata.business_id,
          amount: amount,
          currency: currency.toUpperCase(),
          status: status,
          payment_method: 'paystack',
          paystack_reference: reference,
          transaction_type: metadata.payment_type,
          metadata: metadata
        });
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  };

  const processPayment = async (
    amount: number,
    currency: string,
    email: string,
    metadata: PaymentMetadata,
    clientDetails: ClientDetails,
    showClientDetails: boolean,
    onSuccess: (reference: string) => void,
    onError?: (error: string) => void
  ) => {
    if (!validateInputs(showClientDetails, clientDetails)) return;
    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    const reference = generateReference(metadata);
    const paymentEmail = showClientDetails ? clientDetails.email : email;

    try {
      const handler = window.PaystackPop.setup({
        key: 'pk_live_bf23005a6155ba4e9865b77bd07eebf4c2f52512',
        email: paymentEmail,
        amount: amount * 100, // Convert to kobo
        currency: currency,
        ref: reference,
        metadata: {
          ...metadata,
          client_email: paymentEmail,
          client_phone: clientDetails.phone,
          client_name: clientDetails.name
        },
        callback: function(response: any) {
          setIsProcessing(false);
          
          // Log successful transaction
          logTransaction(response.reference, 'completed', amount, currency, metadata, clientDetails).then(() => {
            toast.success('Payment successful!');
            onSuccess(response.reference);
          }).catch((error) => {
            console.error('Transaction logging failed:', error);
            // Still call onSuccess since payment was successful
            toast.success('Payment successful!');
            onSuccess(response.reference);
          });
        },
        onClose: function() {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (error: any) {
      setIsProcessing(false);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
      onError?.(errorMessage);
      
      // Log failed transaction
      await logTransaction(reference, 'failed', amount, currency, metadata, clientDetails);
    }
  };

  return {
    isProcessing,
    processPayment
  };
};
