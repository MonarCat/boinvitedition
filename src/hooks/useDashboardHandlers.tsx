
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

  return {
    handleNewBooking,
    handleCreateInvoice,
    handleViewClients,
    handleManageServices,
    handleUpdateSettings,
    handleSubscription,
    showCreateBookingModal,
    setShowCreateBookingModal,
    navigate
  };
};
