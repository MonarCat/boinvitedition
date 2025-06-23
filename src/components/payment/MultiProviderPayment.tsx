
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  CreditCard, 
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentProvider {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  bgColor: string;
  available: boolean;
}

interface MultiProviderPaymentProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  businessId: string;
  customerEmail: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export const MultiProviderPayment: React.FC<MultiProviderPaymentProps> = ({
  plan,
  businessId,
  customerEmail,
  onSuccess,
  onError
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  const providers: PaymentProvider[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Pay with M-Pesa STK Push',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      available: true
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: Wallet,
      description: 'Pay with Airtel Money',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      available: true
    },
    {
      id: 'card',
      name: 'Card Payment',
      icon: CreditCard,
      description: 'Visa, Mastercard, and more',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      available: true
    }
  ];

  const initiatePayment = async () => {
    if (!selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }

    if ((selectedProvider === 'mpesa' || selectedProvider === 'airtel') && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: plan.price,
          planId: plan.id,
          businessId,
          customerEmail,
          provider: selectedProvider,
          currency: plan.currency
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (selectedProvider === 'mpesa' || selectedProvider === 'airtel') {
          toast.success(`Check your phone to complete ${selectedProvider.toUpperCase()} payment!`);
          // Poll for payment status
          pollPaymentStatus(data.reference);
        } else if (selectedProvider === 'card') {
          // Redirect to Paystack for card payment
          if (data.authorization_url) {
            window.location.href = data.authorization_url;
          }
        }
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      onError(error.message);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (reference: string) => {
    const maxAttempts = 24; // 2 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/payments/status/${reference}`);
        const data = await response.json();

        if (data.status === 'success') {
          setPaymentStatus('success');
          onSuccess(reference);
          toast.success('Payment completed successfully!');
          return;
        } else if (data.status === 'failed') {
          setPaymentStatus('failed');
          onError('Payment failed');
          toast.error('Payment failed. Please try again.');
          return;
        }

        // Continue polling if pending and within max attempts
        if (attempts < maxAttempts && data.status === 'pending') {
          setTimeout(poll, 5000);
        } else if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          onError('Payment timeout');
          toast.error('Payment verification timeout. Please contact support.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          onError('Status check failed');
        }
      }
    };

    setTimeout(poll, 5000); // Start polling after 5 seconds
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'KES': 'KSh ',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return `${currencySymbols[currency] || currency} ${price.toLocaleString()}`;
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700">
            Your subscription has been activated. Welcome to {plan.name}!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-orange-800">{plan.name}</h3>
              <p className="text-sm text-orange-600">Monthly Subscription</p>
            </div>
            <div className="text-xl font-bold text-orange-800">
              {formatPrice(plan.price, plan.currency)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
            <div className="space-y-3">
              {providers.filter(p => p.available).map((provider) => {
                const Icon = provider.icon;
                
                return (
                  <div key={provider.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={provider.id} id={provider.id} />
                    <div className={`p-2 rounded-lg ${provider.bgColor}`}>
                      <Icon className={`w-5 h-5 ${provider.color}`} />
                    </div>
                    <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-600">{provider.description}</div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Phone Number Input for Mobile Money */}
      {(selectedProvider === 'mpesa' || selectedProvider === 'airtel') && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Phone Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Format: 254XXXXXXXXX (without + or spaces)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      {paymentStatus === 'pending' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <h4 className="font-medium text-blue-800">Processing Payment</h4>
                <p className="text-sm text-blue-700">
                  {selectedProvider === 'mpesa' && 'Check your phone for M-Pesa prompt'}
                  {selectedProvider === 'airtel' && 'Check your phone for Airtel Money prompt'}
                  {selectedProvider === 'card' && 'Redirecting to secure payment page...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      <Button
        onClick={initiatePayment}
        disabled={!selectedProvider || isProcessing || paymentStatus === 'pending'}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay {formatPrice(plan.price, plan.currency)}</>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <p>🔒 Secure payment powered by Paystack</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};
