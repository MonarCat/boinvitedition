import React from 'react';

interface CleanBookingLayoutProps {
  children: React.ReactNode;
}

export const CleanBookingLayout: React.FC<CleanBookingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black text-slate-800 dark:text-slate-200">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
