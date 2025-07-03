import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';

/**
 * Force the dashboard to update after a payment is made
 * This is a fallback mechanism when real-time updates are not working
 */
export const forcePaymentDashboardUpdate = async (
  businessId: string,
  queryClient: QueryClient,
  paymentDetails?: {
    amount?: number;
    reference?: string;
    bookingId?: string;
  }
) => {
  if (!businessId) {
    console.error('Cannot force dashboard update: No business ID provided');
    return false;
  }
  
  console.log('🔄 Forcing dashboard update for business:', businessId);
  
  try {
    // 1. Invalidate all relevant queries immediately
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId], exact: false });
    queryClient.invalidateQueries({ queryKey: ['business-revenue', businessId], exact: false });
    queryClient.invalidateQueries({ queryKey: ['business-data', businessId], exact: false });
    queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
    queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
    queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
    
    if (paymentDetails?.bookingId) {
      queryClient.invalidateQueries({ queryKey: ['booking', paymentDetails.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
    }
    
    // 2. Optional: Send a "ping" to help trigger real-time updates
    // This creates a small record in a monitoring table that will trigger real-time events
    const { error } = await supabase
      .from('system_events')
      .insert({
        event_type: 'dashboard_refresh',
        business_id: businessId,
        metadata: {
          trigger: 'payment_completion',
          timestamp: new Date().toISOString(),
          payment_reference: paymentDetails?.reference || 'manual_update',
          amount: paymentDetails?.amount || 0
        }
      });
      
    if (error) {
      console.warn('Could not create system event for dashboard refresh:', error);
    }
    
    console.log('✅ Dashboard update forced successfully');
    return true;
  } catch (error) {
    console.error('Error forcing dashboard update:', error);
    return false;
  }
};

/**
 * Notify business of new payment through WebSocket if available
 * This creates a direct push notification to the business owner's dashboard
 */
export const notifyBusinessOfPayment = async (
  businessId: string, 
  paymentAmount: number,
  paymentReference: string,
  clientName?: string
) => {
  try {
    // Send a direct message to the business dashboard
    const channel = supabase.channel(`business-notifications-${businessId}`);
    
    await channel
      .send({
        type: 'broadcast',
        event: 'new_payment',
        payload: {
          business_id: businessId,
          payment_amount: paymentAmount,
          payment_reference: paymentReference,
          client_name: clientName || 'Client',
          timestamp: new Date().toISOString()
        }
      });
      
    // Don't need to keep the channel open
    setTimeout(() => {
      channel.unsubscribe();
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('Error notifying business of payment:', error);
    return false;
  }
};
