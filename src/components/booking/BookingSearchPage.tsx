import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Search, Loader2 } from 'lucide-react';
import { CleanBookingLayout } from './CleanBookingLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services: {
    name: string;
  };
  businesses: {
    name: string;
  };
}

export const BookingSearchPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const goBack = () => {
    navigate('/booking/manage');
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Please enter both name and phone number');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(false);
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          customer_name, 
          customer_phone,
          booking_date, 
          booking_time, 
          status,
          services (name),
          businesses (name)
        `)
        .ilike('customer_name', `%${name}%`)
        .eq('customer_phone', phone);
        
      if (error) throw error;
      
      setBookings(data || []);
      setHasSearched(true);
      
      if (data && data.length === 0) {
        toast.info('No bookings found matching your information.');
      }
    } catch (error) {
      console.error('Error searching for bookings:', error);
      toast.error('Something went wrong while searching for your bookings');
    } finally {
      setIsSearching(false);
    }
  };
  
  const viewBookingDetails = (bookingId: string) => {
    navigate(`/booking/details/${bookingId}`);
  };
  
  return (
    <CleanBookingLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Booking</h1>
          <p className="text-gray-600">Enter the details you used when making your booking</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Search for Your Booking</CardTitle>
            <CardDescription>
              Please enter the name and phone number you used when booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter the name used for booking"
                  disabled={isSearching}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                  disabled={isSearching}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Bookings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {hasSearched && bookings.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Your Bookings</h2>
            
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.services.name}</h3>
                      <p className="text-gray-600">{booking.businesses.name}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {' '}at{' '}
                          {booking.booking_time}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => viewBookingDetails(booking.id)}
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {hasSearched && bookings.length === 0 && (
          <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-2">No bookings found</div>
            <p className="text-sm text-gray-600">
              We couldn't find any bookings matching your information. Please check your details and try again.
            </p>
          </div>
        )}
      </div>
    </CleanBookingLayout>
  );
};

export default BookingSearchPage;
