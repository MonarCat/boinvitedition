
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
      
      // Log general payment transaction - convert metadata to JSON
      await supabase
        .from('payment_transactions')
        .insert({
          business_id: metadata.business_id || null,
          amount: amount,
          currency: currency.toUpperCase(),
          status: status,
          payment_method: 'paystack',
          paystack_reference: reference,
          transaction_type: metadata.payment_type,
          metadata: metadata as any // Cast to any to satisfy Json type requirement
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
    
    // Check if Paystack is loaded
    if (!window.PaystackPop) {
      console.log('PaystackPop not found, attempting to load script...');
      try {
        // Import the script loader dynamically to avoid circular dependencies
        const { loadPaystackScript } = await import('@/components/payment/PaystackScriptLoader');
        await loadPaystackScript();
      } catch (error) {
        console.error('Failed to load Paystack script:', error);
        toast.error('Payment system failed to load. Please refresh the page and try again.');
        onError?.('Payment system failed to load');
        return;
      }
      
      // Double-check after loading
      if (!window.PaystackPop) {
        console.error('PaystackPop still not available after loading script');
        toast.error('Payment system not available. Please try again later or contact support.');
        onError?.('Payment system not available');
        return;
      }
    }

    setIsProcessing(true);
    const reference = generateReference(metadata);
    const paymentEmail = showClientDetails ? clientDetails.email : email;
    
    console.log('Setting up Paystack payment:', {
      amount,
      currency,
      email: paymentEmail,
      reference
    });

    try {
      // First, pre-log the transaction attempt
      try {
        await logTransaction(reference, 'initiated', amount, currency, metadata, clientDetails);
        console.log('Payment attempt logged');
      } catch (logError) {
        console.warn('Failed to log payment attempt:', logError);
        // Continue anyway, this is not critical
      }
      
      const handler = window.PaystackPop.setup({
        key: 'pk_live_bf23005a6155ba4e9865b77bd07eebf4c2f52512',
        email: paymentEmail,
        amount: amount * 100, // Convert to kobo/cents
        currency: currency,
        ref: reference,
        metadata: {
          ...metadata,
          client_email: paymentEmail,
          client_phone: clientDetails.phone,
          client_name: clientDetails.name
        },
        callback: function(response) {
          console.log('Payment callback received:', response);
          setIsProcessing(false);
          
          // Log successful transaction and update booking if applicable
          logTransaction(response.reference, 'completed', amount, currency, metadata, clientDetails).then(async () => {
            console.log('Payment transaction logged successfully');
            
            // If this is a booking payment, update the booking status
            if (metadata.payment_type === 'client_to_business' && metadata.booking_id) {
              try {
                const { error: bookingError } = await supabase
                  .from('bookings')
                  .update({
                    status: 'confirmed',
                    payment_status: 'completed',
                    payment_reference: response.reference,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', metadata.booking_id);

                if (bookingError) {
                  console.error('Failed to update booking status:', bookingError);
                } else {
                  console.log('Booking status updated successfully for:', metadata.booking_id);
                }
              } catch (error) {
                console.error('Error updating booking:', error);
              }
            }
            
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
          console.log('Payment modal closed by user');
          setIsProcessing(false);
          
          // Log cancelled transaction
          logTransaction(reference, 'cancelled', amount, currency, metadata, clientDetails)
            .catch(error => console.error('Failed to log cancelled transaction:', error));
            
          toast.info('Payment process cancelled');
        }
      });

      console.log('Opening Paystack iframe...');
      handler.openIframe();
    } catch (error) {
      console.error('Error initializing payment:', error);
      setIsProcessing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      toast.error(errorMessage);
      onError?.(errorMessage);
      
      // Log failed transaction
      await logTransaction(reference, 'failed', amount, currency, metadata, clientDetails)
        .catch(logError => console.error('Failed to log failed transaction:', logError));
    }
  };

  return {
    isProcessing,
    processPayment
  };
};
