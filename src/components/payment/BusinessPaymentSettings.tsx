
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useBusinessPaymentSettings } from '@/hooks/useBusinessPaymentSettings';

interface BusinessPaymentSettingsProps {
  businessId: string;
  subscriptionPlan: string;
}

export const BusinessPaymentSettings: React.FC<BusinessPaymentSettingsProps> = ({
  businessId,
  subscriptionPlan
}) => {
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const { paymentMethods, addPaymentMethod, isAdding } = usePaymentMethods(businessId);
  const { paymentSettings, updatePaymentSettings, isUpdating } = useBusinessPaymentSettings(businessId);
  
  // Disable payment requirement for Pay-As-You-Go users
  const isPayAsYouGo = subscriptionPlan === 'payasyougo';
  const requirePayment = paymentSettings?.require_payment || isPayAsYouGo;
  
  const handleRequirePaymentToggle = (checked: boolean) => {
    if (isPayAsYouGo && !checked) {
      toast.error('Payment requirement cannot be disabled for Pay-As-You-Go subscribers. Clients must pay upfront.');
      return;
    }
    
    updatePaymentSettings({ require_payment: checked });
  };

  const addBankAccount = () => {
    if (!bankAccount.trim()) {
      toast.error('Please enter bank account details');
      return;
    }
    
    addPaymentMethod({
      type: 'bank',
      name: 'Bank Transfer',
      details: bankAccount,
      is_active: true
    });
    setBankAccount('');
  };

  const addMobilePayment = () => {
    if (!mobileNumber.trim()) {
      toast.error('Please enter mobile payment number');
      return;
    }
    
    addPaymentMethod({
      type: 'mobile',
      name: 'Mobile Money',
      details: mobileNumber,
      is_active: true
    });
    setMobileNumber('');
  };

  const setupPaystack = () => {
    if (!paystackPublicKey.trim()) {
      toast.error('Please enter Paystack public key');
      return;
    }
    
    addPaymentMethod({
      type: 'card',
      name: 'Paystack (Cards)',
      details: paystackPublicKey,
      is_active: true
    });
    setPaystackPublicKey('');
    toast.success('Paystack integration added successfully');
  };

  return (
    <div className="space-y-6">
      {/* Payment Requirement Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Client Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPayAsYouGo && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Pay-As-You-Go Plan</h4>
                  <p className="text-sm text-orange-800 mt-1">
                    Clients must pay upfront when booking. Payment requirement is always enabled.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="require-payment">Require Payment</Label>
              <p className="text-sm text-gray-500">
                {isPayAsYouGo 
                  ? 'Clients must pay when booking (Pay-As-You-Go plan)' 
                  : 'Toggle to require clients to pay when booking services'
                }
              </p>
            </div>
            <Switch
              id="require-payment"
              checked={requirePayment}
              onCheckedChange={handleRequirePaymentToggle}
              disabled={isPayAsYouGo || isUpdating}
            />
          </div>
          
          {requirePayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✓ Payment is required. Clients will need to pay before confirming bookings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <p className="text-sm text-gray-600">
            Add payment methods for clients to pay you directly
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paystack Integration */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Paystack (Credit/Debit Cards)
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Paystack Public Key"
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
              />
              <Button onClick={setupPaystack} disabled={isAdding}>
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Get your public key from your Paystack dashboard
            </p>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Bank Transfer
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Bank Name - Account Number - Account Name"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
              <Button onClick={addBankAccount} disabled={isAdding}>
                Add
              </Button>
            </div>
          </div>

          {/* Mobile Money */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Money
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="M-Pesa/Airtel Money Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
              <Button onClick={addMobilePayment} disabled={isAdding}>
                Add
              </Button>
            </div>
          </div>

          {/* Current Payment Methods */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Active Payment Methods</h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        <Badge variant="secondary">{method.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{method.details}</p>
                    </div>
                    <Badge variant={method.is_active ? "default" : "secondary"}>
                      {method.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
