
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentRecord {
  id: string;
  service_id: string;
  client_email: string;
  amount: number;
  currency: string;
  paystack_reference: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const useClientPayments = (businessId: string) => {
  const queryClient = useQueryClient();

  // Fetch business services for payment
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['business-services', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, currency, description')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  // Record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ 
      serviceId, 
      clientEmail, 
      amount, 
      currency, 
      paystackReference 
    }: {
      serviceId: string;
      clientEmail: string;
      amount: number;
      currency: string;
      paystackReference: string;
    }) => {
      // Create a payment record
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          service_id: serviceId,
          client_id: clientEmail, // Using email as temporary client ID
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: new Date().toTimeString().slice(0, 5),
          duration_minutes: 60, // Default duration
          total_amount: amount,
          status: 'confirmed',
          notes: `Payment via Paystack: ${paystackReference}`
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['business-bookings', businessId] });
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    },
  });

  return {
    services,
    servicesLoading,
    recordPayment: recordPaymentMutation.mutate,
    isRecordingPayment: recordPaymentMutation.isPending,
  };
};
