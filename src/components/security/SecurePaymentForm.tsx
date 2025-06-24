
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { useSecureBusinessAccess } from '@/hooks/useSecureBusinessAccess';
import { sanitizeInput, validateEmail, validatePhoneNumber } from '@/utils/securityUtils';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurePaymentFormProps {
  businessId: string;
  amount: number;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export const SecurePaymentForm: React.FC<SecurePaymentFormProps> = ({
  businessId,
  amount,
  onSuccess,
  onError
}) => {
  const { csrfToken, validateCSRFToken } = useCSRFProtection();
  const { hasAccess, validateBusinessAccess } = useSecureBusinessAccess(businessId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    paymentMethod: 'paystack'
  });

  const handleInputChange = (field: string, value: string) => {
    // Sanitize all inputs
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    if (amount <= 0) {
      toast.error('Invalid payment amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Validate CSRF token
    if (!validateCSRFToken(csrfToken)) {
      toast.error('Security validation failed. Please refresh the page.');
      return;
    }

    // Validate business access if required
    if (hasAccess !== undefined && !hasAccess) {
      toast.error('You do not have permission to process payments for this business');
      return;
    }

    setIsProcessing(true);

    try {
      // Create secure payment payload
      const paymentPayload = {
        clientEmail: formData.email,
        clientPhone: formData.phone,
        businessId,
        amount,
        paymentMethod: formData.paymentMethod,
        csrfToken,
        timestamp: new Date().toISOString()
      };

      console.log('Processing secure payment:', {
        businessId,
        amount,
        method: formData.paymentMethod
      });

      // Call secure payment endpoint
      const response = await fetch('/api/secure-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        onSuccess(result.reference);
        toast.success('Payment processed successfully');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment processing failed');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              maxLength={254}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              maxLength={20}
              placeholder="+254700000000"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="paystack">Paystack (Cards, M-Pesa, etc.)</option>
              <option value="mpesa">M-Pesa Direct</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="text-lg font-bold">KES {amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Security Features:</p>
                <ul className="space-y-1">
                  <li>• End-to-end encryption</li>
                  <li>• CSRF protection</li>
                  <li>• Input validation</li>
                  <li>• Rate limiting</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
          </Button>

          <input type="hidden" name="csrf_token" value={csrfToken} />
        </form>
      </CardContent>
    </Card>
  );
};
