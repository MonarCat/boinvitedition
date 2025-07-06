
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Banknote, UserCheck, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatCurrency';

interface DetailedBookingListProps {
  businessId: string;
  showOnlyUpcoming?: boolean;
}

export const DetailedBookingList: React.FC<DetailedBookingListProps> = ({ 
  businessId, 
  showOnlyUpcoming = false 
}) => {
  const queryClient = useQueryClient();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['detailed-bookings', businessId, showOnlyUpcoming],
    queryFn: async () => {
      console.log('Fetching detailed bookings for business:', businessId);
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price, duration_minutes),
          clients:client_id(name, email, phone),
          staff:staff_id(name)
        `)
        .eq('business_id', businessId)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (showOnlyUpcoming) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('booking_date', today).neq('status', 'completed');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      setUpdatingStatusId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Booking marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ['detailed-bookings'] });
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update booking status:', error);
      toast.error('Failed to update booking status');
    },
    onSettled: () => {
      setUpdatingStatusId(null);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'postponed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showOnlyUpcoming ? 'No upcoming bookings' : 'No bookings found'}
          </h3>
          <p className="text-gray-600">
            {showOnlyUpcoming 
              ? 'All bookings are completed or there are no scheduled appointments.' 
              : 'No bookings have been made yet.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {booking.services?.name || 'Service'}
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.booking_date), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.booking_time}
                  </div>
                  {booking.services?.duration_minutes && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {booking.services.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                  <Banknote className="h-4 w-4" />
                  {formatCurrency(Number(booking.total_amount))}
                </div>
                <Badge className={getPaymentStatusColor(booking.payment_status || 'pending')}>
                  {booking.payment_status || 'pending'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Client Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                Client Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {booking.customer_name || booking.clients?.name || 'Not provided'}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="font-medium">Email:</span> {booking.customer_email || booking.clients?.email || 'Not provided'}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="font-medium">Phone:</span> {booking.customer_phone || booking.clients?.phone || 'Not provided'}
                </div>
                {booking.staff && (
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    <span className="font-medium">Staff:</span> {booking.staff.name}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                <h5 className="font-medium text-blue-900 mb-1">Notes:</h5>
                <p className="text-sm text-blue-800">{booking.notes}</p>
              </div>
            )}

            {/* Status Management - Only for non-completed bookings */}
            {booking.status !== 'completed' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Update Status:
                  </label>
                  <Select
                    value={booking.status}
                    disabled={updatingStatusId === booking.id}
                    onValueChange={(status) => updateStatusMutation.mutate({
                      bookingId: booking.id,
                      status
                    })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mark as "Completed" when client shows up and service is finished
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
