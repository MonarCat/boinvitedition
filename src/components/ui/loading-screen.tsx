
import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
          <img 
            src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
            alt="Boinvit Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-3">Boinvit</h1>
        <p className="text-lg opacity-90 mb-8">Complete Business Management Platform</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
};
