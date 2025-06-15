
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface StaffUpcomingBookingsProps {
  staff: any;
  businessId: string;
}

const StaffUpcomingBookings = ({ staff, businessId }: StaffUpcomingBookingsProps) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["staff-upcoming-bookings", staff.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          clients:client_id(name, email),
          services:service_id(name)
        `)
        .eq("business_id", businessId)
        .eq("staff_id", staff.id)
        .gte("booking_date", today)
        .order("booking_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!staff.id && !!businessId
  });

  if (isLoading) return <div>Loading upcoming bookings...</div>;
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-blue-500" />
        <span className="font-medium">Upcoming Bookings</span>
      </div>
      <ul className="text-sm space-y-2">
        {bookings.map((booking: any) => (
          <li key={booking.id} className="border-b last:border-b-0 pb-1">
            <div>
              <span className="font-semibold">{booking.services?.name}</span> &mdash; {booking.clients?.name}
            </div>
            <div className="text-gray-600">
              {format(new Date(booking.booking_date), "PP")} at {booking.booking_time}
            </div>
            <div className="text-xs text-gray-400">{booking.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffUpcomingBookings;
