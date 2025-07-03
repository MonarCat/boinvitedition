import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { realtimeManager } from '@/services/RealtimeConnectionManager';
import { toast } from 'sonner';

export const useDashboardHandlers = () => {
  const navigate = useNavigate();
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);

  const handleNewBooking = () => {
    // Instead of navigating, show the modal
    setShowCreateBookingModal(true);
  };

  const handleCreateInvoice = () => {
    navigate('/app/invoices');
  };

  const handleViewClients = () => {
    navigate('/app/clients');
  };

  const handleManageServices = () => {
    navigate('/app/services');
  };

  const handleUpdateSettings = () => {
    navigate('/app/settings');
  };

  const handleSubscription = () => {
    navigate('/app/subscription');
  };

  const handleForceReconnect = () => {
    realtimeManager.reconnectAll();
    toast.info('Reconnecting...', {
      description: 'Attempting to reconnect all real-time channels.'
    });
  };

  const handleOpenSettings = () => {
    navigate('/app/settings');
  };

  return {
    handleNewBooking,
    handleCreateInvoice,
    handleViewClients,
    handleManageServices,
    handleUpdateSettings,
    handleSubscription,
    handleForceReconnect,
    handleOpenSettings,
    showCreateBookingModal,
    setShowCreateBookingModal,
    navigate
  };
};
