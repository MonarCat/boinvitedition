import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, DollarSign, CheckCircle } from 'lucide-react';

interface PaygExplanationProps {
  amount?: number;
  currency?: string;
}

export const PaygExplanation = ({ 
  amount = 0, 
  currency = 'KES' 
}: PaygExplanationProps) => {
  const commissionRate = 0.05; // 5%
  const commissionAmount = amount * commissionRate;
  const businessAmount = amount - commissionAmount;
  
  const formatCurrency = (value: number) => {
    return `${currency === 'KES' ? 'KSh' : currency} ${value.toLocaleString()}`;
  };
  
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Pay As You Go Pricing Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm">
        <div className="space-y-4">
          <p className="text-gray-700">
            You're using the <strong>Pay As You Go</strong> plan, which means you only pay a commission 
            when you successfully receive payment from a client.
          </p>
          
          {amount > 0 && (
            <div className="bg-gray-50 p-3 rounded border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-500">Client pays:</div>
                  <div className="font-medium">{formatCurrency(amount)}</div>
                </div>
                <div>
                  <div className="text-gray-500">5% Commission:</div>
                  <div className="font-medium text-orange-600">-{formatCurrency(commissionAmount)}</div>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <div className="text-gray-500">You receive:</div>
                  <div className="font-medium text-green-600">{formatCurrency(businessAmount)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Benefits of Pay As You Go:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No monthly subscription fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited bookings and staff members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Only pay when you get paid (5% commission)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Access to all premium features</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
