
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MpesaSTKPushProps {
  amount: number;
  onSuccess: (reference: string) => void;
  onError?: (error: any) => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
  description?: string;
}

export const MpesaSTKPush: React.FC<MpesaSTKPushProps> = ({
  amount,
  onSuccess,
  onError,
  metadata = {},
  disabled = false,
  description = "Payment"
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    // Kenyan phone number validation
    const cleanPhone = phone.replace(/\s+/g, '');
    const kenyanPhoneRegex = /^(\+254|254|0)?([17]\d{8})$/;
    return kenyanPhoneRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.startsWith('+254')) return cleanPhone;
    if (cleanPhone.startsWith('254')) return `+${cleanPhone}`;
    if (cleanPhone.startsWith('0')) return `+254${cleanPhone.substring(1)}`;
    return `+254${cleanPhone}`;
  };

  const handleMpesaPayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessing(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: formattedPhone,
          amount: amount,
          description: description,
          metadata: metadata
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Payment request sent! Please check your phone and enter your M-Pesa PIN.');
        
        // Poll for payment status
        const checkPaymentStatus = async () => {
          const { data: statusData } = await supabase.functions.invoke('check-mpesa-status', {
            body: { checkoutRequestId: data.checkoutRequestId }
          });

          if (statusData?.status === 'completed') {
            onSuccess(statusData.reference);
            toast.success('Payment completed successfully!');
          } else if (statusData?.status === 'failed') {
            toast.error('Payment failed. Please try again.');
            onError?.(statusData.error);
          } else {
            // Continue polling
            setTimeout(checkPaymentStatus, 3000);
          }
        };

        setTimeout(checkPaymentStatus, 5000);
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error('Failed to initiate M-Pesa payment. Please try again.');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Smartphone className="w-5 h-5" />
          Lipa na M-Pesa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="0712345678 or +254712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={disabled || isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your Safaricom number to receive the payment prompt
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Amount: KES {amount.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            You'll receive an M-Pesa prompt on your phone
          </p>
        </div>

        <Button 
          onClick={handleMpesaPayment}
          disabled={disabled || isProcessing || !phoneNumber.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Pay KES {amount.toLocaleString()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
