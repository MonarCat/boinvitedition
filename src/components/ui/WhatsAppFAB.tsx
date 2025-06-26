
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const WhatsAppFAB: React.FC = () => {
  const location = useLocation();
  const whatsappNumber = '254769829304';
  const defaultMessage = "Hello Boinvit! I need help with...";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  // Check if we're on a dashboard page (which already has FloatingActionButton)
  const isDashboardPage = location.pathname.startsWith('/app/');
  
  // Position differently on dashboard pages to avoid conflicts
  const positionClass = isDashboardPage 
    ? "fixed bottom-6 left-6 z-50" // Left side for dashboard pages
    : "fixed bottom-6 right-6 z-50"; // Right side for other pages

  return (
    <div className={positionClass}>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};
