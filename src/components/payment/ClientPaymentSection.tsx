
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, CheckCircle, Info } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface ClientPaymentSectionProps {
  services: Service[];
  clientEmail: string;
  businessName: string;
  businessCurrency?: string;
  paymentInstructions?: string;
  onPaymentSuccess?: (reference: string, serviceId: string) => void;
}

export const ClientPaymentSection: React.FC<ClientPaymentSectionProps> = ({
  services,
  clientEmail,
  businessName,
  businessCurrency = 'KES',
  paymentInstructions
}) => {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KES') {
      return `KES ${price.toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Service Payment - {businessName}
        </CardTitle>
        <p className="text-gray-600">
          Please follow the payment instructions below to complete your booking.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No services available for payment</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <h4 className="font-medium">Selected Services</h4>
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">Service for {clientEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {formatPrice(service.price, service.currency || businessCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paymentInstructions && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <h4 className="font-medium text-orange-800">Payment Instructions</h4>
                </div>
                <p className="text-orange-700 text-sm leading-relaxed">
                  {paymentInstructions}
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Next Steps</span>
              </div>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Follow the payment instructions above</li>
                <li>Complete your payment using the specified method</li>
                <li>Keep your payment reference for confirmation</li>
                <li>Your booking will be confirmed once payment is verified</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
