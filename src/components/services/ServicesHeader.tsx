
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MobileMenuToggle } from '@/components/layout/MobileMenuToggle';

interface ServicesHeaderProps {
  onCreateService: () => void;
}

export const ServicesHeader: React.FC<ServicesHeaderProps> = ({ onCreateService }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Manage your business services and booking system</p>
      </div>
      
      <div className="flex items-center gap-2">
        <MobileMenuToggle>
          <Button variant="ghost" className="w-full justify-start">
            Services
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Bookings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Clients
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </MobileMenuToggle>
        
        <Button onClick={onCreateService} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Service</span>
        </Button>
      </div>
    </div>
  );
};
