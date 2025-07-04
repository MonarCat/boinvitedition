import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingPage } from '@/components/booking/BookingPage';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';
import { ExportButton } from '@/components/ui/ExportButton';

const BookingManagementPage = () => {
  const { user } = useAuth();

  // Get the business for the logged-in user
  const { data: business } = useQuery({
    queryKey: ['current-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { isExporting, exportBookings } = useSpreadsheetExport(business?.id || '');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Booking Management</h1>
            <p className="text-gray-600">Create and manage your bookings</p>
          </div>
          {business && (
            <ExportButton
              onExport={exportBookings}
              isExporting={isExporting}
              label="Bookings"
            />
          )}
        </div>

        <BookingPage />
      </div>
    </DashboardLayout>
  );
};

export default BookingManagementPage;
