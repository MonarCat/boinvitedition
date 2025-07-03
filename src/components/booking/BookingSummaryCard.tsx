import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { Service } from '@/types';

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
    // Always use KES regardless of the currency passed
    return `KES ${price.toLocaleString()}`;
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <Card enhanced className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-royal-red/10 to-transparent border-b border-slate-200 dark:border-slate-700 p-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-royal-red dark:text-royal-red-light">
          <CreditCard className="w-6 h-6 text-royal-red dark:text-royal-red-light" />
          <span>Booking Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {selectedServiceData ? (
          <div className="bg-royal-blue/5 dark:bg-royal-blue/10 rounded-lg p-4 border border-royal-blue/20 dark:border-royal-blue/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{selectedServiceData.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedServiceData.description}</p>
              </div>
              <Badge variant="outline" className="ml-2 text-sm font-medium border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-1.5" />
                {selectedServiceData.duration_minutes} min
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Service Price:</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {formatPrice(
                  selectedServiceData.price,
                  selectedServiceData.currency || business?.currency || 'KES'
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <p>Select a service to see the summary.</p>
          </div>
        )}

        <div className="space-y-3">
          {selectedDate && (
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Appointment Date</div>
              </div>
            </div>
          )}

          {selectedTime && (
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedTime}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Appointment Time</div>
              </div>
            </div>
          )}
        </div>

        {selectedServiceData && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-green-800 dark:text-green-200">Total Amount:</span>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatPrice(
                  selectedServiceData.price,
                  selectedServiceData.currency || business?.currency || 'KES'
                )}
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5"/>
              Payment is required to confirm your booking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
