
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BusinessSetupRequired: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
      <Card className="border-orange-200 bg-orange-50 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-orange-800">Business Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            You need to set up your business profile before subscribing to a plan.
          </p>
          <button
            onClick={() => window.location.href = '/app/settings'}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Set Up Business Profile
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
