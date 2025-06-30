
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Smartphone, Building, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BusinessPayoutSettingsProps {
  businessId: string;
}

export const BusinessPayoutSettings: React.FC<BusinessPayoutSettingsProps> = ({ businessId }) => {
  const [payoutSettings, setPayoutSettings] = useState({
    mpesa_number: '',
    airtel_number: '',
    bank_account_number: '',
    bank_name: '',
    account_holder_name: '',
    is_verified: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPayoutSettings();
  }, [businessId]);

  const loadPayoutSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPayoutSettings({
          mpesa_number: data.mpesa_number || '',
          airtel_number: data.airtel_number || '',
          bank_account_number: data.bank_account_number || '',
          bank_name: data.bank_name || '',
          account_holder_name: data.account_holder_name || '',
          is_verified: data.is_verified || false
        });
      }
    } catch (error) {
      console.error('Error loading payout settings:', error);
      toast.error('Failed to load payout settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('business_payouts')
        .upsert({
          business_id: businessId,
          ...payoutSettings,
          is_verified: false // Reset verification when updating
        });

      if (error) throw error;

      toast.success('Payout settings saved successfully');
      await loadPayoutSettings();
    } catch (error) {
      console.error('Error saving payout settings:', error);
      toast.error('Failed to save payout settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPayoutSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading payout settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payout Settings
          {payoutSettings.is_verified && (
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure where you want to receive payments from clients
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mobile Money Section */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile Money
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mpesa_number">M-Pesa Number</Label>
              <Input
                id="mpesa_number"
                placeholder="254712345678"
                value={payoutSettings.mpesa_number}
                onChange={(e) => handleInputChange('mpesa_number', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="airtel_number">Airtel Money Number</Label>
              <Input
                id="airtel_number"
                placeholder="254712345678"
                value={payoutSettings.airtel_number}
                onChange={(e) => handleInputChange('airtel_number', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Bank Account Section */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Building className="w-4 h-4" />
            Bank Account
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="account_holder_name">Account Holder Name</Label>
              <Input
                id="account_holder_name"
                placeholder="John Doe"
                value={payoutSettings.account_holder_name}
                onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  placeholder="Equity Bank"
                  value={payoutSettings.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  placeholder="1234567890"
                  value={payoutSettings.bank_account_number}
                  onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Verification Status */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-orange-900 mb-1">Verification Required</h5>
              <p className="text-sm text-orange-800">
                After saving your payout details, you'll need to verify your mobile money or bank account 
                to start receiving payments. This helps ensure secure transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Payout Settings'}
        </Button>

        {/* Revenue Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Revenue Sharing</h5>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Platform fee: 3% per transaction (reduced from 5%!)</p>
            <p>• You receive: 97% of each payment</p>
            <p>• Payouts processed within 24 hours</p>
            <p>• Real-time transaction tracking</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
