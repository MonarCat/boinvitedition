
import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductionWhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  businessName?: string;
  position?: 'fixed' | 'inline';
  variant?: 'fab' | 'button' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

export const ProductionWhatsAppButton: React.FC<ProductionWhatsAppButtonProps> = ({
  phoneNumber = '+254769829304',
  message = 'Hello! I need help with Boinvit services.',
  businessName = 'Boinvit Support',
  position = 'fixed',
  variant = 'fab',
  size = 'md'
}) => {
  const handleWhatsAppClick = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-10 h-10';
      case 'lg': return 'w-16 h-16';
      default: return 'w-12 h-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 20;
      case 'lg': return 32;
      default: return 24;
    }
  };

  if (variant === 'fab') {
    return (
      <div className={position === 'fixed' ? 'fixed bottom-6 right-6 z-50' : ''}>
        <button
          onClick={handleWhatsAppClick}
          className={`
            ${getSizeClasses()}
            bg-green-500 hover:bg-green-600 text-white 
            rounded-full shadow-lg flex items-center justify-center 
            transition-all duration-300 hover:scale-110 hover:shadow-xl
            focus:outline-none focus:ring-4 focus:ring-green-200
            animate-pulse hover:animate-none
          `}
          title={`Chat with ${businessName} on WhatsApp`}
          aria-label={`Contact ${businessName} via WhatsApp`}
        >
          <MessageCircle size={getIconSize()} />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            Chat with us on WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        size={size}
      >
        <MessageCircle size={getIconSize()} />
        <span className="hidden sm:inline">WhatsApp Support</span>
        <span className="sm:hidden">Chat</span>
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer" onClick={handleWhatsAppClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-green-900 truncate">
                Need Help?
              </h3>
              <p className="text-sm text-green-700 truncate">
                Chat with {businessName} on WhatsApp
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <Phone className="w-3 h-3" />
                <span>{phoneNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
