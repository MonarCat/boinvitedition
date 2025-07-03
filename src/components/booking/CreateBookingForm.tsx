import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ServiceSelectionCard } from './ServiceSelectionCard';
import { DateTimeSelectionCard } from './DateTimeSelectionCard';
import { PaystackPayment, loadPaystackScript } from '../payment/PaystackPayment';
import { formatCurrency } from '@/utils/formatCurrency';
import { Service } from '@/types';

interface CreateBookingFormProps {
  businessId: string;
  onBookingCreated: () => void;
}

interface ClientData {
  business_id: string;
  name: string;
  email: string;
  phone?: string;
}

interface BookingData {
  business_id: string;
  service_id: string;
  client_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  duration_minutes: number;
  payment_status: string;
  currency?: string;
}

interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  client_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  duration_minutes: number;
  payment_status: string;
  currency: string;
  created_at: string;
  updated_at: string;
  payment_reference?: string;
}

export const CreateBookingForm: React.FC<CreateBookingFormProps> = ({ businessId, onBookingCreated }) => {
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [step, setStep] = useState(1);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);

  useEffect(() => {
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch(() => toast.error('Failed to load payment system'));
  }, []);

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['business-services', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId);
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!businessId,
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientData) => {
      // First check if client exists
      const { data: existingClients, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', clientData.business_id)
        .eq('email', clientData.email)
        .limit(1);
        
      if (searchError) throw searchError;
      
      // If client exists, return the existing client
      if (existingClients && existingClients.length > 0) {
        return existingClients[0];
      }
      
      // Otherwise create a new client
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async ({ clientData, bookingData }: { clientData: ClientData; bookingData: Omit<BookingData, 'client_id'> }) => {
      // First create or find the client
      const client = await createClientMutation.mutateAsync(clientData);
      
      // Then create the booking with the client ID
      const fullBookingData = {
        ...bookingData,
        client_id: client.id,
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(fullBookingData)
        .select()
        .single();
        
      if (error) throw error;
      return {
        ...data,
        currency: fullBookingData.currency || 'KES'
      } as Booking;
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      toast.success('Booking initiated. Proceed to payment.');
      setStep(4); // Move to payment step
    },
    onError: (error: Error) => {
      toast.error(`Error creating booking: ${error.message}`);
    },
  });

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && selectedDate && selectedTime) setStep(3);
  };

  const handleFormSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast.error('Please fill all required fields.');
      return;
    }

    createBookingMutation.mutate({
      clientData: {
        business_id: businessId,
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
      },
      bookingData: {
        business_id: businessId,
        service_id: selectedService.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        status: 'pending',
        total_amount: selectedService.price,
        currency: selectedService.currency || 'KES',
        payment_status: 'pending',
        duration_minutes: selectedService.duration_minutes,
      }
    });
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!bookingDetails) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'completed', payment_reference: reference, status: 'confirmed' })
        .eq('id', bookingDetails.id);

      if (error) throw error;

      toast.success('Booking confirmed successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
      onBookingCreated();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Payment successful but failed to update booking status');
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    setSelectedService(service || null);
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Select a Service</CardTitle></CardHeader>
          <CardContent>
            <ServiceSelectionCard
              services={services || []}
              selectedService={selectedService?.id || ''}
              onServiceSelect={handleServiceSelect}
            />
            <Button onClick={handleNextStep} disabled={!selectedService || isLoadingServices} className="mt-4">
              {isLoadingServices ? 'Loading...' : 'Next'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedService && (
        <Card>
          <CardHeader><CardTitle>Select Date and Time</CardTitle></CardHeader>
          <CardContent>
            <DateTimeSelectionCard
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
            <Button onClick={handleNextStep} disabled={!selectedDate || !selectedTime} className="mt-4">Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Enter Client Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input type="email" placeholder="Client Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            <Input placeholder="Client Phone (Optional)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            <Button onClick={handleFormSubmit} disabled={createBookingMutation.isPending}>
              {createBookingMutation.isPending ? 'Creating Booking...' : 'Proceed to Payment'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && bookingDetails && paystackLoaded && (
        <Card>
          <CardHeader><CardTitle>Confirm Payment</CardTitle></CardHeader>
          <CardContent>
            <p>Total Amount: {formatCurrency(bookingDetails.total_amount, bookingDetails.currency)}</p>
            <PaystackPayment
              email={clientEmail}
              amount={bookingDetails.total_amount * 100} // Paystack amount is in kobo
              onSuccess={handlePaymentSuccess}
              onClose={() => toast.info('Payment was not completed.')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
