
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useClientPayments } from '@/hooks/useClientPayments';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'mobile' | 'card' | 'cash';
  name: string;
  details: string;
  is_active: boolean;
}

interface ClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    price: number;
    currency?: string;
  };
  businessId: string;
  businessName: string;
  paymentMethods: PaymentMethod[];
  onPaymentComplete: () => void;
}

export const ClientPaymentModal: React.FC<ClientPaymentModalProps> = ({
  isOpen,
  onClose,
  service,
  businessId,
  businessName,
  paymentMethods,
  onPaymentComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { recordPayment } = useClientPayments(businessId);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!clientEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod.type === 'card') {
        // Handle Paystack payment
        await handlePaystackPayment();
      } else {
        // Handle other payment methods
        await handleManualPayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    // Initialize Paystack payment
    const paystackKey = selectedMethod?.details;
    if (!paystackKey) {
      toast.error('Paystack configuration not found');
      return;
    }

    // Create payment reference
    const reference = `PAY-${Date.now()}`;
    
    // Record payment attempt
    recordPayment({
      serviceId: service.id,
      clientEmail,
      amount: service.price * 100, // Convert to kobo/cents
      currency: service.currency || 'NGN',
      paystackReference: reference
    });

    toast.success('Payment recorded successfully!');
    onPaymentComplete();
    onClose();
  };

  const handleManualPayment = async () => {
    if (!paymentProof.trim()) {
      toast.error('Please provide payment confirmation details');
      return;
    }

    // Record manual payment
    recordPayment({
      serviceId: service.id,
      clientEmail,
      amount: service.price,
      currency: service.currency || 'USD',
      paystackReference: `MANUAL-${Date.now()}`
    });

    toast.success('Payment recorded successfully!');
    onPaymentComplete();
    onClose();
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank':
        return <Banknote className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium">{service.name}</h3>
            <p className="text-sm text-gray-600">{businessName}</p>
            <p className="text-lg font-bold text-green-600">
              {service.currency || 'USD'} {service.price}
            </p>
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="client-email">Your Email Address</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="Enter your email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="space-y-2">
              {paymentMethods.filter(method => method.is_active).map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedMethod?.id === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <div className="flex items-center gap-3">
                    {getPaymentIcon(method.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        <Badge variant="secondary">{method.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{method.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Proof for Manual Methods */}
          {selectedMethod && selectedMethod.type !== 'card' && (
            <div className="space-y-2">
              <Label htmlFor="payment-proof">Payment Confirmation</Label>
              <Input
                id="payment-proof"
                placeholder="Transaction ID, Reference Number, or Payment Details"
                value={paymentProof}
                onChange={(e) => setPaymentProof(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Provide the transaction reference or confirmation details
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!selectedMethod || !clientEmail.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
