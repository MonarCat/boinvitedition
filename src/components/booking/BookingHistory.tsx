import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Banknote, Building, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  services: {
    name: string;
    price: number;
    currency: string;
  };
  businesses: {
    name: string;
    address: string;
    city: string;
    currency: string;
  };
}

export const BookingHistory = () => {
  const [clientDetails, setClientDetails] = useState({
    name: '',
    phone: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientDetails.name || !clientDetails.phone) {
      toast.error('Please provide both your name and phone number');
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          payment_status,
          total_amount,
          services:service_id(name, price, currency),
          businesses:business_id(name, address, city, currency)
        `)
        .eq('customer_name', clientDetails.name)
        .eq('customer_phone', clientDetails.phone)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });
      
      if (error) throw error;
      
      setBookings(data || []);
      
      if (data && data.length === 0) {
        toast.info('No bookings found with the provided details.');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to retrieve bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">View Your Booking History</CardTitle>
          <CardDescription>Enter the details you used when making your booking</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
              <Input 
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={clientDetails.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
              <Input 
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={clientDetails.phone}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : 'Find My Bookings'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {isLoading ? 'Finding your bookings...' : 
              bookings.length > 0 ? `Found ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}` : 'No bookings found'}
          </h2>

          {bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className={`h-2 ${getStatusColor(booking.status)}`}></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{booking.services?.name}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                        {booking.payment_status === 'completed' ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Payment pending
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(booking.total_amount, booking.businesses?.currency)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(booking.booking_date), 'PP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{booking.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{booking.businesses?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-gray-500" />
                        <span>{formatCurrency(booking.total_amount, booking.businesses?.currency)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <ViewDetailsButton booking={booking} />
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <RescheduleButton booking={booking} />
                      )}
                      {booking.status === 'completed' && (
                        <WriteReviewButton booking={booking} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Additional button components
const ViewDetailsButton = ({ booking }: { booking: Booking }) => {
  const handleViewDetails = () => {
    // Store the booking details in sessionStorage for the details page
    sessionStorage.setItem('viewedBooking', JSON.stringify(booking));
    window.location.href = `/booking/details/${booking.id}`;
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleViewDetails}>
      View Details
    </Button>
  );
};

const RescheduleButton = ({ booking }: { booking: Booking }) => {
  const handleReschedule = () => {
    // Store the booking details in sessionStorage for the reschedule page
    sessionStorage.setItem('rescheduleBooking', JSON.stringify(booking));
    window.location.href = `/booking/reschedule/${booking.id}`;
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleReschedule}>
      Reschedule
    </Button>
  );
};

const WriteReviewButton = ({ booking }: { booking: Booking }) => {
  const handleReview = () => {
    // Store the booking details in sessionStorage for the review page
    sessionStorage.setItem('reviewBooking', JSON.stringify(booking));
    window.location.href = `/booking/review/${booking.id}`;
  };
  
  return (
    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleReview}>
      Write Review
    </Button>
  );
};
