
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StaffPerformanceCard from "@/components/staff/StaffPerformanceCard";
import StaffUpcomingBookings from "@/components/staff/StaffUpcomingBookings";
import StaffAttendanceHistory from "@/components/staff/StaffAttendanceHistory";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StaffDashboardPage = () => {
  const { user } = useAuth();

  // Fetch business id
  const { data: business } = useQuery({
    queryKey: ["user-business", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch staff list
  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("business_id", business.id)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading staff dashboard...</div>
      </DashboardLayout>
    );
  }

  if (!staff || staff.length === 0) {
    return (
      <DashboardLayout>
        <div>No staff found for this business.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((member: any) => (
            <div className="space-y-5" key={member.id}>
              <StaffPerformanceCard staff={member} businessId={business.id} />
              <StaffUpcomingBookings staff={member} businessId={business.id} />
              <StaffAttendanceHistory staff={member} businessId={business.id} />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboardPage;
