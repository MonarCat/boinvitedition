
import { useState } from 'react';
import { toast } from 'sonner';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { sanitizeInput, validateEmail, validatePhoneNumber } from '@/utils/enhancedSecurityUtils';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface ClientDetails {
  email: string;
  phone: string;
  name: string;
}

export const usePaystackPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { monitorSuspiciousPayments, logSecurityEvent } = useSecurityMonitoring();

  const processPayment = async (
    amount: number,
    currency: string,
    email: string,
    metadata: any,
    clientDetails: ClientDetails,
    showClientDetails: boolean,
    onSuccess?: (reference: string) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setIsProcessing(true);

      // Enhanced input validation and sanitization
      const sanitizedEmail = sanitizeInput(email || clientDetails.email).toLowerCase();
      const sanitizedPhone = sanitizeInput(clientDetails.phone);
      const sanitizedName = sanitizeInput(clientDetails.name);

      // Validate required fields
      if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
        toast.error('Please provide a valid email address');
        onError?.('Invalid email address');
        return;
      }

      if (showClientDetails) {
        if (!sanitizedName.trim()) {
          toast.error('Please provide your name');
          onError?.('Name is required');
          return;
        }

        if (sanitizedPhone && !validatePhoneNumber(sanitizedPhone)) {
          toast.error('Please provide a valid phone number');
          onError?.('Invalid phone number');
          return;
        }
      }

      // Security monitoring for suspicious payments
      if (metadata.business_id) {
        await monitorSuspiciousPayments(amount, metadata.business_id);
      }

      // Log payment attempt
      await logSecurityEvent('PAYMENT_ATTEMPT', 'Payment processing initiated', {
        amount,
        currency,
        business_id: metadata.business_id,
        payment_type: metadata.payment_type,
        timestamp: new Date().toISOString()
      });

      if (!window.PaystackPop) {
        throw new Error('Paystack not loaded. Please refresh the page.');
      }

      const paymentData = {
        key: 'pk_test_4b4b4d0b4e8c4c8b8c8c8c8c8c8c8c8c', // This should come from env
        email: sanitizedEmail,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: currency.toUpperCase(),
        metadata: {
          ...metadata,
          client_name: sanitizedName,
          client_phone: sanitizedPhone,
          sanitized: true,
          security_validated: true
        },
        callback: async (response: any) => {
          try {
            console.log('Payment successful:', response);
            
            // Log successful payment
            await logSecurityEvent('PAYMENT_SUCCESS', 'Payment completed successfully', {
              reference: response.reference,
              amount,
              currency,
              business_id: metadata.business_id,
              timestamp: new Date().toISOString()
            });

            toast.success('Payment successful!');
            onSuccess?.(response.reference);
          } catch (error) {
            console.error('Payment callback error:', error);
            await logSecurityEvent('PAYMENT_CALLBACK_ERROR', 'Payment callback failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              reference: response.reference,
              timestamp: new Date().toISOString()
            });
          }
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsProcessing(false);
        }
      };

      const handler = window.PaystackPop.setup(paymentData);
      handler.openIframe();

    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Log payment error
      await logSecurityEvent('PAYMENT_ERROR', 'Payment processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        amount,
        currency,
        business_id: metadata.business_id,
        timestamp: new Date().toISOString()
      });

      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processPayment
  };
};
