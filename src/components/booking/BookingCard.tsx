
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: any;
  onPaymentClick: (booking: any) => void;
  paystackLoaded: boolean;
  formatPrice: (price: number, currency: string) => string;
  getStatusColor: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPaymentClick,
  paystackLoaded,
  formatPrice,
  getStatusColor,
  getPaymentStatusColor
}) => {
  const isPendingPayment = booking.payment_status === 'pending' && booking.status !== 'cancelled';

  return (
    <Card className={`transition-all duration-200 ${isPendingPayment ? 'border-2 border-orange-200 bg-orange-50' : 'hover:shadow-md'}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            {/* Header with service name and badges */}
            <div className="flex items-start gap-3 flex-wrap">
              <h3 className="font-semibold text-lg text-gray-900">{booking.services?.name}</h3>
              <div className="flex gap-2">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                <Badge className={getPaymentStatusColor(booking.payment_status)}>
                  {booking.payment_status}
                </Badge>
              </div>
            </div>
            
            {/* Booking details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{format(new Date(booking.booking_date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-green-600" />
                <span>{booking.booking_time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="font-medium">
                  {formatPrice(
                    booking.total_amount, 
                    booking.services?.currency || booking.businesses?.currency || 'KES'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="truncate">{booking.businesses?.name}</span>
              </div>
            </div>

            {/* Location details */}
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>{booking.businesses?.address}, {booking.businesses?.city}</span>
              </div>
            </div>

            {/* Notes if available */}
            {booking.notes && (
              <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                <strong className="text-blue-800">Notes:</strong>
                <p className="text-blue-700 mt-1">{booking.notes}</p>
              </div>
            )}

            {/* Payment reference */}
            {booking.payment_reference && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <strong>Payment Reference:</strong> {booking.payment_reference}
              </div>
            )}
          </div>

          {/* Payment action button */}
          {isPendingPayment && (
            <div className="ml-4 flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                <AlertCircle className="h-3 w-3" />
                Payment Required
              </div>
              <Button
                onClick={() => onPaymentClick(booking)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                disabled={!paystackLoaded}
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay to Confirm
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
