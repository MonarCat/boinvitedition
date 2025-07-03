import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateBookingForm } from '@/components/booking/CreateBookingForm';

interface BusinessCreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const BusinessCreateBookingModal: React.FC<BusinessCreateBookingModalProps> = ({
  isOpen,
  onClose,
  businessId,
}) => {
  const handleBookingCreated = () => {
    // Close the modal and potentially show a success message
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Booking for Client</DialogTitle>
          <DialogDescription>
            Create a booking for a walk-in client. This will follow the regular booking flow, including payment.
          </DialogDescription>
        </DialogHeader>
        
        <CreateBookingForm 
          businessId={businessId} 
          onBookingCreated={handleBookingCreated} 
        />
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
