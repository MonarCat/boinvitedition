
import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink } from 'lucide-react';

interface QRSharingMethodsProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
  businessName: string;
  bookingUrl: string;
}

export const QRSharingMethods: React.FC<QRSharingMethodsProps> = ({
  validationStatus,
  businessName,
  bookingUrl
}) => {
  const getAlternativeBookingMethods = () => {
    return {
      whatsapp: `https://wa.me/?text=Book%20services%20with%20${encodeURIComponent(businessName)}:%20${encodeURIComponent(bookingUrl)}`,
      sms: `sms:?body=Book services with ${businessName}: ${bookingUrl}`,
      email: `mailto:?subject=Book services with ${businessName}&body=You can book services here: ${bookingUrl}`
    };
  };

  const alternativeUrls = getAlternativeBookingMethods();

  const shareViaWhatsApp = () => {
    window.open(alternativeUrls.whatsapp, '_blank');
  };

  const shareViaSMS = () => {
    window.location.href = alternativeUrls.sms;
  };

  const shareViaEmail = () => {
    window.location.href = alternativeUrls.email;
  };

  const isDisabled = validationStatus !== 'valid';

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Share Your Business:</h4>
      
      <div className="grid grid-cols-1 gap-2">
        <Button 
          onClick={shareViaWhatsApp} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Share via WhatsApp
        </Button>
        
        <Button 
          onClick={shareViaSMS} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Share via SMS
        </Button>
        
        <Button 
          onClick={shareViaEmail} 
          variant="outline" 
          size="sm"
          disabled={isDisabled}
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Share via Email
        </Button>
      </div>
    </div>
  );
};
