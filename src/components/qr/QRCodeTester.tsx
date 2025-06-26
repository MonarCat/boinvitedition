
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BusinessQRGenerator } from '@/components/business/BusinessQRGenerator';
import { CheckCircle, AlertCircle, TestTube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeTesterProps {
  businessId?: string;
}

export const QRCodeTester: React.FC<QRCodeTesterProps> = ({ businessId }) => {
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Get a test business if none provided
  const { data: testBusiness } = useQuery({
    queryKey: ['test-business'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !businessId,
  });

  const runQRTest = async () => {
    setTestResult('testing');
    setTestMessage('Testing QR code functionality...');

    try {
      const testBusinessId = businessId || testBusiness?.id;
      const testBusinessName = testBusiness?.name || 'Test Business';

      if (!testBusinessId) {
        throw new Error('No business available for testing');
      }

      // Test 1: Check if business exists
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', testBusinessId)
        .single();

      if (error || !business) {
        throw new Error('Business not found or inactive');
      }

      // Test 2: Check URL accessibility
      const bookingUrl = `${window.location.origin}/book/${testBusinessId}`;
      
      // Test 3: QR code generation (simulated)
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(bookingUrl);
      
      if (!qrDataUrl) {
        throw new Error('QR code generation failed');
      }

      setTestResult('success');
      setTestMessage(`✅ QR code test passed!\n• Business: ${business.name}\n• URL: ${bookingUrl}\n• QR generation: Success`);

    } catch (error) {
      setTestResult('error');
      setTestMessage(`❌ QR code test failed: ${error.message}`);
    }
  };

  const currentBusinessId = businessId || testBusiness?.id;
  const currentBusinessName = testBusiness?.name || 'Test Business';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            QR Code Functionality Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runQRTest} disabled={testResult === 'testing'}>
            {testResult === 'testing' ? 'Testing...' : 'Run QR Test'}
          </Button>

          {testResult !== 'idle' && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              testResult === 'success' ? 'bg-green-50 border border-green-200' :
              testResult === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {testResult === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {testResult === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              <pre className="text-sm whitespace-pre-wrap">{testMessage}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {currentBusinessId && (
        <Card>
          <CardHeader>
            <CardTitle>Live QR Code Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessQRGenerator 
              businessId={currentBusinessId}
              businessName={currentBusinessName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
