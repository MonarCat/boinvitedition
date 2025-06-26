
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFAB: React.FC = () => {
  const whatsappNumber = '254769829304';
  const defaultMessage = "Hello Boinvit! I need help with...";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};
