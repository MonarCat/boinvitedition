
import React, { useState } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedStaffList } from '@/components/staff/EnhancedStaffList';
import { EnhancedStaffForm } from '@/components/staff/EnhancedStaffForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';
import { ExportButton } from '@/components/ui/ExportButton';

const StaffPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
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

  const { isExporting, exportStaff } = useSpreadsheetExport(business?.id || '');

  const handleCreateStaff = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your team members and their schedules</p>
          </div>
          <div className="flex items-center gap-2">
            {business && (
              <ExportButton
                onExport={exportStaff}
                isExporting={isExporting}
                label="Staff"
              />
            )}
            <Button onClick={handleCreateStaff} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {showForm && (
          <EnhancedStaffForm 
            staff={editingStaff} 
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        )}

        <EnhancedStaffList onEditStaff={handleEditStaff} />
      </div>
    </DashboardLayout>
  );
};

export default StaffPage;
