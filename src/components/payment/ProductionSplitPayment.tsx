
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building, Percent, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DirectPaystackPayment } from './DirectPaystackPayment';
import { toast } from 'sonner';

interface ProductionSplitPaymentProps {
  businessId: string;
  businessName: string;
  amount: number;
  currency: string;
  bookingId?: string;
  serviceId?: string;
  onPaymentSuccess?: (reference: string) => void;
  onPaymentError?: (error: string) => void;
}

interface SplitConfig {
  platform_percentage: number;
  business_percentage: number;
  platform_amount: number;
  business_amount: number;
  has_paystack_subaccount: boolean;
  subaccount_code?: string;
}

export const ProductionSplitPayment: React.FC<ProductionSplitPaymentProps> = ({
  businessId,
  businessName,
  amount,
  currency,
  bookingId,
  serviceId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [splitConfig, setSplitConfig] = useState<SplitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSplitConfiguration();
  }, [businessId]);

  const loadSplitConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get business payout settings
      const { data: payout, error: payoutError } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (payoutError) throw payoutError;

      // Calculate split amounts
      const platformPercentage = 7.5; // 7.5% platform fee
      const businessPercentage = 100 - platformPercentage;
      
      const platformAmount = (amount * platformPercentage) / 100;
      const businessAmount = amount - platformAmount;

      const config: SplitConfig = {
        platform_percentage: platformPercentage,
        business_percentage: businessPercentage,
        platform_amount: Number(platformAmount.toFixed(2)),
        business_amount: Number(businessAmount.toFixed(2)),
        has_paystack_subaccount: Boolean(payout?.paystack_subaccount_code),
        subaccount_code: payout?.paystack_subaccount_code || undefined
      };

      setSplitConfig(config);

    } catch (error: any) {
      console.error('Split configuration error:', error);
      setError('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Record the transaction with split details
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          business_id: businessId,
          booking_id: bookingId,
          amount: amount,
          platform_amount: splitConfig?.platform_amount || 0,
          business_amount: splitConfig?.business_amount || 0,
          currency: currency,
          status: 'completed',
          paystack_reference: reference,
          transaction_type: 'client_to_business',
          split_config: splitConfig ? {
            platform_percentage: splitConfig.platform_percentage,
            business_percentage: splitConfig.business_percentage,
            subaccount_code: splitConfig.subaccount_code
          } : null,
          metadata: {
            service_id: serviceId,
            payment_method: 'paystack'
          }
        });

      if (transactionError) throw transactionError;

      toast.success('Payment completed successfully!');
      onPaymentSuccess?.(reference);

    } catch (error: any) {
      console.error('Transaction recording error:', error);
      toast.error('Payment completed but failed to record transaction');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    onPaymentError?.(error);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Loading payment configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !splitConfig) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || 'Failed to load payment configuration'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={loadSplitConfiguration} 
            variant="outline" 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Breakdown */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="w-5 h-5" />
            Payment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold text-lg">
                {formatAmount(amount, currency)}
              </span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>To {businessName}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatAmount(splitConfig.business_amount, currency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {splitConfig.business_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span>Platform Fee</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatAmount(splitConfig.platform_amount, currency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {splitConfig.platform_percentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Split Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              {splitConfig.has_paystack_subaccount ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
              <h4 className="text-sm font-medium text-gray-900">
                Automatic Split Payment
              </h4>
            </div>
            <p className="text-xs text-gray-700">
              {splitConfig.has_paystack_subaccount ? (
                'Funds will be automatically split between the business and platform'
              ) : (
                'Manual settlement required - business will receive funds after platform fee deduction'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Component */}
      <DirectPaystackPayment
        amount={amount}
        currency={currency}
        metadata={{
          payment_type: 'client_to_business',
          business_id: businessId,
          booking_id: bookingId,
          business_name: businessName,
          platform_fee: splitConfig.platform_amount,
          business_amount: splitConfig.business_amount,
          subaccount_code: splitConfig.subaccount_code
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        title={`Pay ${businessName}`}
        description="Secure split payment powered by Paystack"
        showClientDetails={true}
        buttonText="Pay"
      />

      {/* Security Notice */}
      <Card className="w-full max-w-md mx-auto bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <h4 className="font-medium mb-1">Secure Split Payment</h4>
              <p className="text-green-700">
                Your payment is securely processed and automatically distributed. 
                The business receives their portion while the platform fee is handled separately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
