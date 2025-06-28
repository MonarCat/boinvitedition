
import React, { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { ensureAuthButtonsVisible } from '@/utils/buttonVisibility';

const AuthPage = () => {
  // Ensure auth buttons visibility
  useEffect(() => {
    ensureAuthButtonsVisible();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/5 to-royal-blue/10 flex items-center justify-center p-4">
      <AuthForm />
    </div>
  );
};

export default AuthPage;
