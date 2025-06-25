
import React from 'react';

interface CleanBookingLayoutProps {
  children: React.ReactNode;
}

export const CleanBookingLayout: React.FC<CleanBookingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {children}
      </div>
    </div>
  );
};
