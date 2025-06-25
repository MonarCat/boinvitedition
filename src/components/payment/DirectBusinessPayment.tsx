
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Smartphone, Building, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { DirectPaystackPayment } from './DirectPaystackPayment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DirectBusinessPaymentProps {
  businessId: string;
  businessName: string;
  amount: number;
  currency: string;
  bookingId?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
}

export const DirectBusinessPayment: React.FC<DirectBusinessPaymentProps> = ({
  businessId,
  businessName,
  amount,
  currency,
  bookingId,
  onSuccess,
  onError
}) => {
  const [businessPayment, setBusinessPayment] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('paystack');

  useEffect(() => {
    loadBusinessPaymentData();
  }, [businessId]);

  const loadBusinessPaymentData = async () => {
    try {
      // Load business payment setup
      const { data: business } = await supabase
        .from('businesses')
        .select('payment_setup_complete, paystack_subaccount_id, mpesa_number, bank_name, bank_account, payment_instructions')
        .eq('id', businessId)
        .single();

      // Load business payout configuration
      const { data: payout } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .single();

      // Load payment configs
      const { data: configs } = await supabase
        .from('business_payment_configs')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      setBusinessPayment({ ...business, ...payout });
      setPaymentMethods(configs || []);
    } catch (error) {
      console.error('Error loading business payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Calculate split amounts
      const platformFee = amount * 0.05; // 5% platform fee
      const businessAmount = amount - platformFee;

      // Record the transaction with split tracking
      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          business_id: businessId,
          booking_id: bookingId,
          amount: amount,
          business_received_amount: businessAmount,
          platform_fee_amount: platformFee,
          currency: currency.toUpperCase(),
          status: 'completed',
          payment_method: 'paystack_split',
          paystack_reference: reference,
          transaction_type: 'client_to_business',
          split_config: {
            business_percentage: 95,
            platform_percentage: 5,
            business_amount: businessAmount,
            platform_amount: platformFee
          }
        });

      if (error) throw error;

      toast.success(`Payment successful! ${businessName} receives ${currency} ${businessAmount.toLocaleString()}`);
      onSuccess?.(reference);
    } catch (error) {
      console.error('Error recording split payment:', error);
      toast.error('Payment successful but failed to record transaction details');
      onSuccess?.(reference);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    onError?.(error);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!businessPayment?.payment_setup_complete) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Payment Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This business hasn't completed their payment setup yet. 
              Please contact {businessName} to set up their payment accounts 
              for direct client payments.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Alternative Payment</h4>
            <p className="text-sm text-blue-800 mb-3">
              You can still pay through our standard payment system.
            </p>
            <DirectPaystackPayment
              amount={amount}
              currency={currency}
              metadata={{
                payment_type: 'client_to_business',
                business_id: businessId,
                booking_id: bookingId,
                business_name: businessName
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              title={`Pay ${businessName}`}
              showClientDetails={true}
              buttonText="Pay Standard Rate"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Split Information */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="w-5 h-5" />
            Direct Business Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded border border-green-200">
              <div className="text-lg font-bold text-green-700">
                {currency} {(amount * 0.95).toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Goes to {businessName}</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-green-200">
              <div className="text-lg font-bold text-blue-700">
                {currency} {(amount * 0.05).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Platform Fee (5%)</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>Payment will be split automatically</span>
          </div>
        </CardContent>
      </Card>

      {/* Business Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {businessPayment.paystack_subaccount_code && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border border-blue-200">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Cards & Mobile Money</div>
                  <div className="text-sm text-gray-600">Automatic split payment</div>
                </div>
                <Badge className="bg-blue-500">Recommended</Badge>
              </div>
            )}
            
            {businessPayment.mpesa_number && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border border-green-200">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium">M-Pesa Direct</div>
                  <div className="text-sm text-gray-600">{businessPayment.mpesa_number}</div>
                </div>
                <Badge variant="outline">Manual</Badge>
              </div>
            )}
            
            {businessPayment.bank_name && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border border-purple-200">
                <Building className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium">{businessPayment.bank_name}</div>
                  <div className="text-sm text-gray-600">{businessPayment.bank_account_number}</div>
                </div>
                <Badge variant="outline">Manual</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Component */}
      {businessPayment.paystack_subaccount_code ? (
        <DirectPaystackPayment
          amount={amount}
          currency={currency}
          metadata={{
            payment_type: 'client_to_business',
            business_id: businessId,
            booking_id: bookingId,
            business_name: businessName,
            subaccount_code: businessPayment.paystack_subaccount_code
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          title={`Pay ${businessName} Directly`}
          description="95% goes directly to business, 5% platform fee"
          showClientDetails={true}
          buttonText={`Pay ${currency} ${amount.toLocaleString()}`}
        />
      ) : (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-yellow-800 mb-2">Manual Payment Required</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Please pay directly using the business payment details above, 
                then contact them to confirm your payment.
              </p>
              <div className="text-lg font-bold text-yellow-800">
                Total: {currency} {amount.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      {businessPayment.payment_instructions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 whitespace-pre-line">
              {businessPayment.payment_instructions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
