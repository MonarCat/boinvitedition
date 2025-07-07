import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Booking } from '@/types/models';

// Interface for payment transactions based on the actual structure
interface PaymentTransaction {
  id: string;
  reference?: string;
  status: string;
  amount: number;
  business_amount?: number;
  customer_email?: string;
  description?: string;
  business_id: string;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Type for the payload from Supabase real-time
interface RealtimePayload<T> {
  new: T;
  old: Partial<T>;
  [key: string]: unknown;
}

export const useRealtimeBookingNotifications = (businessId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [newBookings, setNewBookings] = useState<Booking[]>([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Clear notifications
  const clearNotifications = () => {
    setNewBookings([]);
    setHasNotifications(false);
  };

  useEffect(() => {
    if (!businessId || !user) return;

    // Create a channel for the business bookings
    const channel = supabase
      .channel(`business-bookings-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload: RealtimePayload<Booking>) => {
          console.log('🔔 New booking detected!', payload);
          
          // Show a notification toast
          toast.success('New Booking Received!', {
            description: `A new booking has been made for your business`,
            action: {
              label: 'View',
              onClick: () => {
                // You could implement navigation to bookings page
                window.location.href = '/app/bookings';
              },
            },
          });
          
          // Add to new bookings list
          setNewBookings(prev => [payload.new, ...prev].slice(0, 10));
          setHasNotifications(true);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        (payload: RealtimePayload<Booking>) => {
          console.log('📝 Booking updated:', payload);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe((status) => {
        console.log('Booking notifications channel status:', status);
        setIsListening(status === 'SUBSCRIBED');
      });

    // Also listen for payments
    const paymentsChannel = supabase
      .channel(`business-payments-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        (payload: RealtimePayload<PaymentTransaction>) => {
          console.log('💰 New payment received!', payload);
          
          // Show a notification toast
          toast.success('New Payment Received!', {
            description: `A payment of $${payload.new.amount?.toFixed(2) || '0.00'} has been received`,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/app/finance';
              },
            },
          });
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      paymentsChannel.unsubscribe();
    };
  }, [businessId, user, queryClient]);

  // This function will force a refresh of the data
  const refreshData = () => {
    if (!businessId) return;
    
    queryClient.invalidateQueries({ queryKey: ['bookings', businessId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
    queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
    
    toast.info('Refreshing booking data...');
  };

  return {
    isListening,
    newBookings,
    hasNotifications,
    clearNotifications,
    refreshData
  };
};