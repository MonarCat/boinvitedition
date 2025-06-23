
import React, { useState } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientsList } from '@/components/clients/ClientsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SecureClientForm } from '@/components/clients/SecureClientForm';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';
import { ExportButton } from '@/components/ui/ExportButton';

const ClientsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
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

  const { isExporting, exportClients } = useSpreadsheetExport(business?.id || '');

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client database</p>
          </div>
          <div className="flex items-center gap-2">
            {business && (
              <ExportButton
                onExport={exportClients}
                isExporting={isExporting}
                label="Clients"
              />
            )}
            <Button onClick={handleCreateClient} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        {showForm && (
          <SecureClientForm 
            client={editingClient} 
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        )}

        <ClientsList onEditClient={handleEditClient} />
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
