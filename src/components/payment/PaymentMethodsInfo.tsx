
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Smartphone, Building } from 'lucide-react';

export const PaymentMethodsInfo: React.FC = () => {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center text-center">
            <CreditCard className="w-6 h-6 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Cards</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Smartphone className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-600">M-Pesa</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Building className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-xs text-gray-600">Bank</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
