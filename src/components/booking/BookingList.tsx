import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Banknote, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingListProps {
  businessId?: string;
  clientView?: boolean;
}

export const BookingList = ({ businessId, clientView = false }: BookingListProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (businessId) return { id: businessId };
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const actualBusinessId = businessId || business?.id;

  // Set up a refetch interval to keep bookings up to date
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings-list', actualBusinessId, clientView],
    queryFn: async () => {
      if (!actualBusinessId) return [];
      
      console.log('Fetching bookings for business:', actualBusinessId);
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price),
          clients:client_id(name, email),
          staff:staff_id(name)
        `)
        .eq('business_id', actualBusinessId)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (clientView) {
        // For client view, only show their bookings
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('business_id', actualBusinessId)
          .eq('email', user?.email)
          .single();
        
        if (client) {
          query = query.eq('client_id', client.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!actualBusinessId,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      setUpdatingStatusId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Booking marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
    onSettled: () => {
      setUpdatingStatusId(null);
    }
  });

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

  // Setup periodic refresh for bookings data
  useEffect(() => {
    if (!actualBusinessId) return;
    
    // Create a refresh interval that checks for new bookings every 15 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing bookings list');
      refetch();
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [actualBusinessId, refetch]);

  // Setup real-time booking updates
  useEffect(() => {
    if (!actualBusinessId) return;
    
    console.log('Setting up booking list realtime listener');
    
    // Create channel for realtime updates
    const bookingChannel = supabase
      .channel(`bookings-list-${actualBusinessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${actualBusinessId}`
        },
        (payload) => {
          console.log('BookingList: Booking change detected in realtime', payload);
          // Immediately refresh the data
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up booking list realtime listener');
      supabase.removeChannel(bookingChannel);
    };
  }, [actualBusinessId, refetch, queryClient]);

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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">
            {clientView ? 'You have no bookings at this time.' : 'No bookings have been made yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{booking.services?.name}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.booking_date), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.booking_time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Banknote className="h-4 w-4" />
                    KES {booking.total_amount.toLocaleString()}
                  </div>
                </div>

                {!clientView && booking.clients && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {booking.clients.name} ({booking.clients.email})
                  </div>
                )}

                {booking.staff && (
                  <div className="text-sm text-gray-600">
                    Staff: {booking.staff.name}
                  </div>
                )}

                {booking.notes && (
                  <div className="text-sm text-gray-600">
                    Notes: {booking.notes}
                  </div>
                )}

                {/* Booking status management dropdown - admin/staff only */}
                {!clientView && (
                  <div className="pt-3">
                    <label htmlFor={`status-${booking.id}`} className="text-sm font-medium">
                      Change Status:
                    </label>
                    <select
                      id={`status-${booking.id}`}
                      value={booking.status}
                      disabled={updatingStatusId === booking.id}
                      onChange={e => updateStatusMutation.mutate({
                        bookingId: booking.id,
                        status: e.target.value
                      })}
                      className="ml-2 border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

              {booking.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelBookingMutation.mutate(booking.id)}
                  disabled={cancelBookingMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
