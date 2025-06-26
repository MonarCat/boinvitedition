
import React from 'react';
import { FindServicesMap } from '@/components/map/FindServicesMap';
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB';

const BusinessDiscoveryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FindServicesMap />
      
      {/* WhatsApp Support Button */}
      <WhatsAppFAB />
    </div>
  );
};

export default BusinessDiscoveryPage;
