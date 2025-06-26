
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CreditCard, Calendar } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface BookingSummaryCardProps {
  selectedService: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  services: Service[];
  business?: { currency?: string };
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  selectedService,
  selectedDate,
  selectedTime,
  services,
  business
}) => {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KES' || currency === 'KSH') {
      return `KSh ${price.toLocaleString()}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CreditCard className="w-5 h-5" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedServiceData && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedServiceData.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedServiceData.description}</p>
              </div>
              <Badge variant="secondary" className="ml-2">
                <Clock className="w-3 h-3 mr-1" />
                {selectedServiceData.duration_minutes}min
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Service Price:</span>
              <span className="font-bold text-lg text-blue-600">
                {formatPrice(
                  selectedServiceData.price,
                  selectedServiceData.currency || business?.currency || 'KES'
                )}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {selectedDate && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="text-xs text-gray-500">Appointment Date</div>
              </div>
            </div>
          )}

          {selectedTime && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">{selectedTime}</div>
                <div className="text-xs text-gray-500">Appointment Time</div>
              </div>
            </div>
          )}
        </div>

        {selectedServiceData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800">Total Amount:</span>
              <span className="text-xl font-bold text-green-700">
                {formatPrice(
                  selectedServiceData.price,
                  selectedServiceData.currency || business?.currency || 'KES'
                )}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Payment required to confirm booking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
