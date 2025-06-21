
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Building, Info } from 'lucide-react';

interface PaymentInstructionsProps {
  business: {
    name: string;
    payment_instructions?: string;
    preferred_payment_methods?: string[];
    phone_number?: string;
    mpesa_number?: string;
    bank_account?: string;
    bank_name?: string;
  };
}

export const BusinessPaymentInstructions: React.FC<PaymentInstructionsProps> = ({ business }) => {
  const paymentMethods = business.preferred_payment_methods || [];

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <CreditCard className="w-5 h-5" />
          Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {business.payment_instructions && (
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
              <h4 className="font-medium text-orange-800">Payment Instructions</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {business.payment_instructions}
            </p>
          </div>
        )}

        {paymentMethods.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-800 mb-2">Accepted Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method, index) => (
                <Badge key={index} variant="outline" className="text-orange-700 border-orange-300">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {business.mpesa_number && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
            <Smartphone className="w-4 h-4 text-green-600" />
            <div>
              <span className="font-medium text-gray-700">M-Pesa: </span>
              <span className="text-green-600 font-mono">{business.mpesa_number}</span>
            </div>
          </div>
        )}

        {business.bank_account && business.bank_name && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
            <Building className="w-4 h-4 text-blue-600" />
            <div>
              <div>
                <span className="font-medium text-gray-700">Bank: </span>
                <span className="text-blue-600">{business.bank_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account: </span>
                <span className="text-blue-600 font-mono">{business.bank_account}</span>
              </div>
            </div>
          </div>
        )}

        {business.phone_number && (
          <div className="text-sm text-gray-600 pt-2 border-t border-orange-200">
            For payment assistance, contact: <span className="font-medium">{business.phone_number}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
