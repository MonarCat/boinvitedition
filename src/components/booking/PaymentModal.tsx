
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaystackPayment } from '../payment/PaystackPayment';
import { PaymentMethodsInfo } from '../payment/PaymentMethodsInfo';
import { PaymentSecurityNotice } from '../payment/PaymentSecurityNotice';

interface PaymentModalProps {
  booking: any;
  userEmail: string;
  onSuccess: (reference: string, bookingId: string) => void;
  onClose: () => void;
  formatPrice: (price: number, currency: string) => string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  userEmail,
  onSuccess,
  onClose,
  formatPrice
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card enhanced className="w-full max-w-md">
        <CardHeader className="text-center pb-4 bg-gradient-to-r from-royal-blue/10 to-transparent">
          <CardTitle className="text-xl font-bold text-royal-blue dark:text-royal-blue-light">
            Pay to Confirm Booking
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Complete payment to secure your appointment
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Service:</span>
                <span className="text-blue-900 font-medium">{booking.services?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Amount:</span>
                <span className="text-blue-900 font-bold text-lg">
                  {formatPrice(
                    booking.total_amount,
                    booking.services?.currency || 
                    booking.businesses?.currency || 'KES'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods Info */}
          <PaymentMethodsInfo />

          {/* Payment Button */}
          <div className="space-y-3">
            <PaystackPayment
              amount={booking.total_amount}
              email={userEmail}
              currency={
                booking.services?.currency || 
                booking.businesses?.currency || 'KES'
              }
              onSuccess={(reference) => onSuccess(reference, booking.id)}
              metadata={{
                booking_id: booking.id,
                service_name: booking.services?.name,
                business_name: booking.businesses?.name
              }}
              className="w-full"
            />
            
            <PaymentSecurityNotice />
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full mt-4 border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
