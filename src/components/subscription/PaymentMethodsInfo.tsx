
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Smartphone, CreditCard, TrendingUp } from 'lucide-react';

export const PaymentMethodsInfo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Multiple Secure Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">M-Pesa Mobile Money</h4>
              <p className="text-sm text-gray-600">Pay instantly using your M-Pesa account - most popular option</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Cards & Bank Transfer</h4>
              <p className="text-sm text-gray-600">Visa, Mastercard, and direct bank transfers supported</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Auto-Split Payments</h4>
              <p className="text-sm text-gray-600">Automatic revenue sharing for pay-as-you-go plans</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
