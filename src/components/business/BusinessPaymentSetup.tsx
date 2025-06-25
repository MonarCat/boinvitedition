
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Building, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';

interface BusinessPaymentSetupProps {
  businessId: string;
  onSetupComplete?: () => void;
}

export const BusinessPaymentSetup: React.FC<BusinessPaymentSetupProps> = ({
  businessId,
  onSetupComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    mpesa_number: '',
    bank_name: '',
    bank_account_number: '',
    account_holder_name: '',
    paystack_subaccount_code: '',
    auto_split_enabled: false
  });

  useEffect(() => {
    loadPaymentData();
  }, [businessId]);

  const loadPaymentData = async () => {
    try {
      // Load existing payout data
      const { data: payout } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (payout) {
        setPayoutData(payout);
        setFormData({
          mpesa_number: payout.mpesa_number || '',
          bank_name: payout.bank_name || '',
          bank_account_number: payout.bank_account_number || '',
          account_holder_name: payout.account_holder_name || '',
          paystack_subaccount_code: payout.paystack_subaccount_code || '',
          auto_split_enabled: payout.auto_split_enabled || false
        });
      }

      // Load payment configs
      const { data: configData } = await supabase
        .from('business_payment_configs')
        .select('*')
        .eq('business_id', businessId);

      setConfigs(configData || []);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const savePaymentData = async () => {
    setLoading(true);
    try {
      // Upsert business payout data
      const { error: payoutError } = await supabase
        .from('business_payouts')
        .upsert({
          business_id: businessId,
          ...formData,
          split_percentage: 95.0
        });

      if (payoutError) throw payoutError;

      // Update business payment setup status
      const hasValidPayment = formData.mpesa_number || 
        (formData.bank_name && formData.bank_account_number) ||
        formData.paystack_subaccount_code;

      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          payment_setup_complete: hasValidPayment,
          paystack_subaccount_id: formData.paystack_subaccount_code || null
        })
        .eq('id', businessId);

      if (businessError) throw businessError;

      toast.success('Payment settings saved successfully');
      loadPaymentData();
      onSetupComplete?.();
    } catch (error: any) {
      console.error('Error saving payment data:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentConfig = async (type: string, configData: any) => {
    try {
      const { error } = await supabase
        .from('business_payment_configs')
        .insert({
          business_id: businessId,
          payment_type: type,
          config_data: configData,
          is_active: true
        });

      if (error) throw error;
      
      toast.success(`${type} configuration saved`);
      loadPaymentData();
    } catch (error: any) {
      console.error('Error creating payment config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const getPaymentStatus = () => {
    const hasPaystack = formData.paystack_subaccount_code;
    const hasMpesa = formData.mpesa_number;
    const hasBank = formData.bank_name && formData.bank_account_number;

    if (hasPaystack || hasMpesa || hasBank) {
      return { status: 'complete', color: 'bg-green-500', text: 'Setup Complete' };
    }
    return { status: 'incomplete', color: 'bg-red-500', text: 'Setup Required' };
  };

  const status = getPaymentStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Business Payment Setup
          </div>
          <Badge className={status.color}>
            {status.status === 'complete' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
            {status.text}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure where clients' payments should be sent. You'll receive 95% directly, Boinvit keeps 5%.
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="paystack" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paystack">Paystack Split</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            <TabsTrigger value="bank">Bank Account</TabsTrigger>
          </TabsList>

          <TabsContent value="paystack" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommended: Automatic Split</h4>
              <p className="text-sm text-blue-800">
                Clients pay once, you receive 95% automatically, Boinvit receives 5%. 
                Requires a Paystack subaccount.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paystack-subaccount">Paystack Subaccount Code</Label>
              <Input
                id="paystack-subaccount"
                placeholder="ACCT_xxxxxxxxxx"
                value={formData.paystack_subaccount_code}
                onChange={(e) => setFormData({...formData, paystack_subaccount_code: e.target.value})}
              />
              <p className="text-xs text-gray-600">
                Create a subaccount in your Paystack dashboard and enter the code here
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-split"
                checked={formData.auto_split_enabled}
                onCheckedChange={(checked) => setFormData({...formData, auto_split_enabled: checked})}
              />
              <Label htmlFor="auto-split">Enable automatic payment splitting</Label>
            </div>
          </TabsContent>

          <TabsContent value="mpesa" className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">M-Pesa Direct</h4>
              <p className="text-sm text-green-800">
                Clients can pay directly to your M-Pesa number. Platform fee collected separately.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mpesa-number">M-Pesa Phone Number</Label>
              <Input
                id="mpesa-number"
                placeholder="254700000000"
                value={formData.mpesa_number}
                onChange={(e) => setFormData({...formData, mpesa_number: e.target.value})}
              />
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Bank Transfer</h4>
              <p className="text-sm text-orange-800">
                Clients can transfer directly to your bank account. Platform fee collected separately.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  placeholder="Kenya Commercial Bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  placeholder="1234567890"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input
                id="account-holder"
                placeholder="John Doe"
                value={formData.account_holder_name}
                onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={savePaymentData} disabled={loading}>
            {loading ? 'Saving...' : 'Save Payment Settings'}
          </Button>
        </div>

        {/* Current Configurations */}
        {configs.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">Active Configurations</h4>
            <div className="space-y-2">
              {configs.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{config.payment_type}</span>
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
