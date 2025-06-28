
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-cream to-cream-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-royal-blue/10 to-royal-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-royal-red/10 to-royal-red/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cream/20 to-cream-dark/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full">
        <AuthForm />
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-gradient-to-br from-royal-blue to-royal-blue-dark rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-gradient-to-br from-royal-red to-royal-red-dark rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-5 h-5 bg-gradient-to-br from-cream-dark to-cream rounded-full opacity-30 animate-pulse delay-500"></div>
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-gradient-to-br from-royal-blue-light to-royal-blue rounded-full opacity-25 animate-pulse delay-700"></div>
    </div>
  );
};

export default AuthPage;
