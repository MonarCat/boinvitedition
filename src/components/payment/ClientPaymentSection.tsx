
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import { PaystackPayment, loadPaystackScript } from './PaystackPayment';
import { toast } from 'sonner';

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
  onPaymentSuccess?: (reference: string, serviceId: string) => void;
}

export const ClientPaymentSection: React.FC<ClientPaymentSectionProps> = ({
  services,
  clientEmail,
  businessName,
  onPaymentSuccess
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch(() => toast.error('Failed to load payment system'));
  }, []);

  const handlePaymentSuccess = (reference: string) => {
    toast.success('Payment completed successfully!');
    onPaymentSuccess?.(reference, selectedService?.id || '');
    setSelectedService(null);
  };

  if (!paystackLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payment system...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay for Services
        </CardTitle>
        <p className="text-gray-600">
          Select a service and make a secure payment to {businessName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No services available for payment</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedService?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {service.currency} {service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedService && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="flex justify-between items-center mb-4">
                  <span>Service: {selectedService.name}</span>
                  <span className="font-bold">
                    {selectedService.currency} {selectedService.price.toLocaleString()}
                  </span>
                </div>
                
                <PaystackPayment
                  amount={selectedService.price}
                  email={clientEmail}
                  currency={selectedService.currency}
                  onSuccess={handlePaymentSuccess}
                  metadata={{
                    service_id: selectedService.id,
                    service_name: selectedService.name,
                    business_name: businessName
                  }}
                />
              </div>
            )}
          </>
        )}

        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your payment is processed securely by Paystack. We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
