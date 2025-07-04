
import { useContext } from 'react';
import { useBooking as useBookingContext } from '../context/BookingContext';

export const useBooking = () => {
  return useBookingContext();
};
