import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the structure of a booking
export interface Booking {
  id?: string;
  business_id?: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  staff_id?: string;
  staff_name?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes?: string;
  amount: number;
  status: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

interface BookingState {
  selectedBusiness: any;
  selectedService: any;
  selectedDate: string;
  selectedTime: string;
  selectedStaff: any;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  loading: boolean;
  error: string | null;
}

type BookingAction =
  | { type: 'SET_BUSINESS'; payload: any }
  | { type: 'SET_SERVICE'; payload: any }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_STAFF'; payload: any }
  | { type: 'SET_CLIENT_INFO'; payload: Partial<BookingState['clientInfo']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING' };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_BUSINESS':
      return { ...state, selectedBusiness: action.payload };
    case 'SET_SERVICE':
      return { ...state, selectedService: action.payload };
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_STAFF':
      return { ...state, selectedStaff: action.payload };
    case 'SET_CLIENT_INFO':
      return { ...state, clientInfo: { ...state.clientInfo, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
}

const initialState: BookingState = {
  selectedBusiness: null,
  selectedService: null,
  selectedDate: '',
  selectedTime: '',
  selectedStaff: null,
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
  loading: false,
  error: null,
};

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  submitBooking: () => Promise<void>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const submitBooking = async () => {
    if (!state.selectedBusiness || !state.selectedService || !state.selectedDate || !state.selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // First, create or get the client
      let clientId = null;
      
      // Check if client exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', state.selectedBusiness.id)
        .eq('email', state.clientInfo.email)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            business_id: state.selectedBusiness.id,
            name: state.clientInfo.name,
            email: state.clientInfo.email,
            phone: state.clientInfo.phone,
            notes: state.clientInfo.notes,
          })
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create the booking
      const bookingData = {
        business_id: state.selectedBusiness.id,
        client_id: clientId,
        service_id: state.selectedService.id,
        staff_id: state.selectedStaff?.id,
        booking_date: state.selectedDate,
        booking_time: state.selectedTime,
        duration_minutes: state.selectedService.duration_minutes,
        total_amount: Number(state.selectedService.price),
        customer_name: state.clientInfo.name,
        customer_email: state.clientInfo.email,
        customer_phone: state.clientInfo.phone,
        notes: state.clientInfo.notes,
        status: 'confirmed',
        payment_status: 'pending',
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast.success('Booking created successfully!');
      dispatch({ type: 'RESET_BOOKING' });
    } catch (error) {
      console.error('Error creating booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create booking. Please try again.' });
      toast.error('Failed to create booking. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
  };

  return (
    <BookingContext.Provider value={{ state, dispatch, submitBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
