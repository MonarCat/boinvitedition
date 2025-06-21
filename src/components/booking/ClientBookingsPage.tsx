
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PaystackPayment, loadPaystackScript } from '../payment/PaystackPayment';

export const ClientBookingsPage = () => {
  const { user } = useAuth();
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  React.useEffect(() => {
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch(() => toast.error('Failed to load payment system'));
  }, []);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['client-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price, currency),
          businesses:business_id(name, address, city, currency)
        `)
        .eq('customer_email', user.email)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email,
  });

  const handlePaymentSuccess = async (reference: string, bookingId: string) => {
    try {
      // Update booking payment status
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          payment_reference: reference
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Payment completed successfully!');
      setSelectedBookingForPayment(null);
      refetch();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Payment successful but failed to update booking status');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KES') {
      return `KES ${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">You haven't made any bookings yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your service bookings</p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{booking.services?.name}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(booking.payment_status)}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.booking_date), 'PPP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.booking_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {formatPrice(
                          booking.total_amount, 
                          booking.services?.currency || booking.businesses?.currency || 'KES'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {booking.businesses?.name} - {booking.businesses?.address}, {booking.businesses?.city}
                    </div>

                    {booking.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}

                    {booking.payment_reference && (
                      <div className="text-xs text-gray-500">
                        Payment Reference: {booking.payment_reference}
                      </div>
                    )}
                  </div>

                  {booking.payment_status === 'pending' && booking.status !== 'cancelled' && (
                    <div className="ml-4">
                      <Button
                        onClick={() => setSelectedBookingForPayment(booking)}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!paystackLoaded}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedBookingForPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <p className="text-sm text-gray-600">
                  Pay for: {selectedBookingForPayment.services?.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Amount:</span>
                    <span className="font-bold">
                      {formatPrice(
                        selectedBookingForPayment.total_amount,
                        selectedBookingForPayment.services?.currency || 
                        selectedBookingForPayment.businesses?.currency || 'KES'
                      )}
                    </span>
                  </div>
                </div>

                <PaystackPayment
                  amount={selectedBookingForPayment.total_amount}
                  email={user?.email || ''}
                  currency={
                    selectedBookingForPayment.services?.currency || 
                    selectedBookingForPayment.businesses?.currency || 'KES'
                  }
                  onSuccess={(reference) => handlePaymentSuccess(reference, selectedBookingForPayment.id)}
                  metadata={{
                    booking_id: selectedBookingForPayment.id,
                    service_name: selectedBookingForPayment.services?.name,
                    business_name: selectedBookingForPayment.businesses?.name
                  }}
                />

                <Button
                  variant="outline"
                  onClick={() => setSelectedBookingForPayment(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
