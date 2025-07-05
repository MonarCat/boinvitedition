import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Building, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Ban,
  Clock4,
  Banknote,
  Tag,
  User
} from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  created_at: string;
  services: {
    name: string;
    price: number;
    duration_minutes: number;
    currency: string;
    description?: string;
  };
  businesses: {
    name: string;
    address: string;
    city: string;
    currency: string;
    phone: string;
  };
}

export const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // First try to get from session storage if coming from booking history
        const storedBooking = sessionStorage.getItem('viewedBooking');
        if (storedBooking) {
          const parsedBooking = JSON.parse(storedBooking);
          setBooking(parsedBooking);
          sessionStorage.removeItem('viewedBooking');
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        if (bookingId) {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              id,
              booking_date,
              booking_time,
              status,
              payment_status,
              total_amount,
              customer_name,
              customer_email,
              customer_phone,
              notes,
              created_at,
              services:service_id(name, price, duration_minutes, currency, description),
              businesses:business_id(name, address, city, currency, phone)
            `)
            .eq('id', bookingId)
            .single();
          
          if (error) throw error;
          if (!data) throw new Error('Booking not found');
          
          setBooking(data);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError('Unable to load booking details. The booking may not exist or you may not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { icon: CheckCircle2, className: 'bg-green-100 text-green-800', text: 'Confirmed' };
      case 'cancelled':
        return { icon: Ban, className: 'bg-red-100 text-red-800', text: 'Cancelled' };
      case 'completed':
        return { icon: CheckCircle2, className: 'bg-blue-100 text-blue-800', text: 'Completed' };
      case 'pending':
        return { icon: Clock4, className: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'rescheduled':
        return { icon: Calendar, className: 'bg-purple-100 text-purple-800', text: 'Rescheduled' };
      default:
        return { icon: AlertCircle, className: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  // Get payment status badge styling
  const getPaymentBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { icon: CheckCircle2, className: 'bg-green-100 text-green-800', text: 'Paid' };
      case 'pending':
        return { icon: Clock4, className: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'failed':
        return { icon: AlertCircle, className: 'bg-red-100 text-red-800', text: 'Failed' };
      default:
        return { icon: Banknote, className: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl text-center">
        <Card>
          <CardContent className="py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Booking Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">The booking you're looking for could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const StatusBadge = getStatusBadge(booking.status);
  const PaymentBadge = getPaymentBadge(booking.payment_status);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bookings
      </Button>
      
      {/* Booking Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{booking.services?.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${StatusBadge.className}`}>
                  <StatusBadge.icon className="mr-1 h-3 w-3" />
                  {StatusBadge.text}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PaymentBadge.className}`}>
                  <PaymentBadge.icon className="mr-1 h-3 w-3" />
                  {PaymentBadge.text}
                </span>
              </div>
            </div>
            <div className="text-right mt-2 md:mt-0">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="font-mono text-sm md:text-base font-medium">{booking.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{format(parseISO(booking.booking_date), 'PPPP')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{booking.booking_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{booking.services?.duration_minutes} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(booking.total_amount, booking.businesses?.currency)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Business Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <p className="font-medium">{booking.businesses?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <p>{booking.businesses?.address}, {booking.businesses?.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <p>{booking.businesses?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Service Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold">{booking.services?.name}</h3>
              {booking.services?.description && (
                <p className="text-sm text-gray-600 mt-1">{booking.services.description}</p>
              )}
            </div>
            <div className="text-right mt-2 md:mt-0">
              <p className="font-bold">{formatCurrency(booking.services?.price, booking.services?.currency)}</p>
              <p className="text-sm text-gray-500">{booking.services?.duration_minutes} min</p>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <p className="font-bold">Total</p>
              <p className="font-bold">{formatCurrency(booking.total_amount, booking.businesses?.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Client Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{booking.customer_name}</p>
            </div>
          </div>
          {booking.customer_email && (
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{booking.customer_email}</p>
              </div>
            </div>
          )}
          {booking.customer_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{booking.customer_phone}</p>
              </div>
            </div>
          )}
          {booking.notes && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Booking Created</p>
                <p className="font-medium">{format(parseISO(booking.created_at), 'PPp')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-mono">{booking.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Having issues with your booking?</p>
          </div>
          <div>
            <Button variant="outline" onClick={() => {
              // Create WhatsApp link with booking info
              const message = `Hello, I have a question about my booking (ID: ${booking.id}) on ${format(parseISO(booking.booking_date), 'PP')} at ${booking.booking_time}`;
              window.open(`https://wa.me/${booking.businesses?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
            }}>
              Contact Business
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
