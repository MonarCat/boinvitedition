
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PlanFeaturesComparison: React.FC = () => {
  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">What's Included in Every Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-600">Free Trial Benefits</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• KES 10 one-time setup fee</li>
              <li>• 14 days complete access</li>
              <li>• All premium features</li>
              <li>• Perfect for testing</li>
              <li>• No monthly charges during trial</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-purple-600">Pay As You Go</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• KES 10 one-time setup fee</li>
              <li>• 7% commission per booking</li>
              <li>• You receive 93% instantly</li>
              <li>• Prepaid bookings only</li>
              <li>• Perfect for low volume</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-blue-600">Subscription Plans</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Starter: 5 staff, 1K bookings</li>
              <li>• Business: 15 staff, 3K bookings</li>
              <li>• Enterprise: Unlimited everything</li>
              <li>• Up to 30% long-term discounts</li>
              <li>• Predictable monthly costs</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-green-600">Core Features</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• QR code booking system</li>
              <li>• WhatsApp notifications</li>
              <li>• Online booking calendar</li>
              <li>• Client management system</li>
              <li>• Payment processing</li>
              <li>• Analytics dashboard</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
