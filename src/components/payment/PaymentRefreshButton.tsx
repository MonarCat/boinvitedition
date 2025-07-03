import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentRefreshButtonProps {
  paymentReference?: string;
  bookingId?: string;
  businessId: string;
  onRefreshComplete?: (status: string | null) => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

/**
 * A button component that manually checks payment status
 * For use when real-time updates aren't working
 */
export const PaymentRefreshButton: React.FC<PaymentRefreshButtonProps> = ({
  paymentReference,
  bookingId,
  businessId,
  onRefreshComplete,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the last payment reference from localStorage if not provided
  const actualReference = paymentReference || localStorage.getItem('lastPaymentReference');
  
  const handleRefresh = async () => {
    if (!actualReference && !bookingId) {
      toast.error('No payment reference or booking ID available');
      return;
    }
    
    setIsRefreshing(true);
    toast.info('Checking payment status...');
    
    try {
      let paymentStatus: string | null = null;
      
      // Check for payment using reference if available
      if (actualReference) {
        const [paymentTxResult, clientBusinessTxResult, paymentsResult] = await Promise.all([
          // Check payment_transactions table
          supabase
            .from('payment_transactions')
            .select('status')
            .eq('paystack_reference', actualReference)
            .maybeSingle(),
          
          // Check client_business_transactions table
          supabase
            .from('client_business_transactions')
            .select('status')
            .eq('paystack_reference', actualReference)
            .maybeSingle(),
          
          // Check payments table
          supabase
            .from('payments')
            .select('status')
            .eq('reference', actualReference)
            .maybeSingle()
        ]);
        
        // Get first available status
        paymentStatus = 
          paymentTxResult.data?.status || 
          clientBusinessTxResult.data?.status || 
          paymentsResult.data?.status || 
          null;
      }
      // If no reference but have booking ID, check by booking
      else if (bookingId) {
        const { data } = await supabase
          .from('bookings')
          .select('payment_status')
          .eq('id', bookingId)
          .single();
        
        paymentStatus = data?.payment_status || null;
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      
      // Show appropriate toast based on status
      if (paymentStatus === 'completed' || paymentStatus === 'success' || paymentStatus === 'paid') {
        toast.success('Payment confirmed! Status: Paid');
      } else if (paymentStatus === 'pending') {
        toast.info('Payment is still pending. Please try again in a moment.');
      } else if (paymentStatus === 'failed') {
        toast.error('Payment failed. Please try again or use a different payment method.');
      } else {
        toast.info('No payment information found. If you completed the payment, it may still be processing.');
      }
      
      // Call the callback if provided
      onRefreshComplete?.(paymentStatus);
    } catch (error) {
      console.error('Error refreshing payment status:', error);
      toast.error('Failed to check payment status');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleRefresh}
      disabled={isRefreshing || (!actualReference && !bookingId)}
    >
      {isRefreshing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Checking...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Payment Status
        </>
      )}
    </Button>
  );
};
