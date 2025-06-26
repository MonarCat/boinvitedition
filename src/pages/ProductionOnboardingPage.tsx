
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProductionBusinessSetup } from '@/components/business/ProductionBusinessSetup';
import { Navigate } from 'react-router-dom';

const ProductionOnboardingPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <ProductionBusinessSetup />;
};

export default ProductionOnboardingPage;
