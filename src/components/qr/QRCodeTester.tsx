
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QRTestResult {
  businessId: string;
  businessExists: boolean;
  businessActive: boolean;
  businessName?: string;
  servicesCount: number;
  urlAccessible: boolean;
  errorMessage?: string;
}

export const QRCodeTester: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<QRTestResult | null>(null);

  const extractBusinessIdFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bookIndex = pathParts.indexOf('book');
      
      if (bookIndex !== -1 && pathParts[bookIndex + 1]) {
        return pathParts[bookIndex + 1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const testQRCode = async () => {
    if (!testUrl) {
      toast.error('Please enter a QR code URL to test');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const businessId = extractBusinessIdFromUrl(testUrl);
      
      if (!businessId) {
        setTestResult({
          businessId: 'invalid',
          businessExists: false,
          businessActive: false,
          servicesCount: 0,
          urlAccessible: false,
          errorMessage: 'Could not extract business ID from URL'
        });
        return;
      }

      console.log('QR Test: Testing business ID:', businessId);

      // Test business exists and is active
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .maybeSingle();

      if (businessError) {
        setTestResult({
          businessId,
          businessExists: false,
          businessActive: false,
          servicesCount: 0,
          urlAccessible: false,
          errorMessage: `Database error: ${businessError.message}`
        });
        return;
      }

      const businessExists = !!business;
      const businessActive = business?.is_active || false;

      // Test services count
      let servicesCount = 0;
      if (businessExists) {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (!servicesError) {
          servicesCount = services?.length || 0;
        }
      }

      // Test URL accessibility (basic check)
      let urlAccessible = false;
      try {
        // Simple check - if we can construct the URL without errors
        new URL(testUrl);
        urlAccessible = true;
      } catch {
        urlAccessible = false;
      }

      setTestResult({
        businessId,
        businessExists,
        businessActive,
        businessName: business?.name,
        servicesCount,
        urlAccessible,
        errorMessage: businessExists ? undefined : 'Business not found in database'
      });

      if (businessExists && businessActive) {
        toast.success('QR code test passed!');
      } else {
        toast.error('QR code test failed - see details below');
      }

    } catch (error) {
      console.error('QR Test Error:', error);
      setTestResult({
        businessId: 'error',
        businessExists: false,
        businessActive: false,
        servicesCount: 0,
        urlAccessible: false,
        errorMessage: `Test failed: ${error.message}`
      });
      toast.error('Test failed with error');
    } finally {
      setIsTesting(false);
    }
  };

  const openTestUrl = () => {
    if (testUrl) {
      window.open(testUrl, '_blank');
    }
  };

  const getOverallStatus = (): 'pass' | 'fail' | 'warning' => {
    if (!testResult) return 'fail';
    
    if (testResult.businessExists && testResult.businessActive && testResult.urlAccessible) {
      return testResult.servicesCount > 0 ? 'pass' : 'warning';
    }
    
    return 'fail';
  };

  const getStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">All Tests Passed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning - No Services</Badge>;
      case 'fail':
        return <Badge variant="destructive">Tests Failed</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          QR Code System Tester
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test any QR code booking URL to verify it works correctly
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <Label htmlFor="test-url">QR Code URL or Booking URL</Label>
          <div className="flex gap-2">
            <Input
              id="test-url"
              placeholder="https://yoursite.com/book/business-id"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={testQRCode}
              disabled={isTesting || !testUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
        </div>

        {/* Quick Test Examples */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">Example URLs to test:</p>
          <div className="space-y-1">
            <button
              onClick={() => setTestUrl(`${window.location.origin}/book/f958f752-2971-4c67-9d45-53dc0159ac67`)}
              className="text-xs text-blue-600 hover:text-blue-800 block"
            >
              {window.location.origin}/book/example-business-id
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Results</h3>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Details */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-3">Business Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Business ID:</span>
                    <span className="font-mono text-xs">{testResult.businessId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exists:</span>
                    <span className={testResult.businessExists ? 'text-green-600' : 'text-red-600'}>
                      {testResult.businessExists ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active:</span>
                    <span className={testResult.businessActive ? 'text-green-600' : 'text-red-600'}>
                      {testResult.businessActive ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  {testResult.businessName && (
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{testResult.businessName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-3">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>URL Valid:</span>
                    <span className={testResult.urlAccessible ? 'text-green-600' : 'text-red-600'}>
                      {testResult.urlAccessible ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services Count:</span>
                    <span className={testResult.servicesCount > 0 ? 'text-green-600' : 'text-yellow-600'}>
                      {testResult.servicesCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bookable:</span>
                    <span className={testResult.servicesCount > 0 ? 'text-green-600' : 'text-yellow-600'}>
                      {testResult.servicesCount > 0 ? '✅ Yes' : '⚠️ No Services'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {testResult.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900">Error Details:</p>
                <p className="text-sm text-red-800">{testResult.errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={openTestUrl}
                variant="outline"
                size="sm"
                disabled={!testResult.urlAccessible}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Booking Page
              </Button>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Recommendations:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {!testResult.businessExists && <li>• Create or verify the business in your system</li>}
                {!testResult.businessActive && <li>• Activate the business in your admin panel</li>}
                {testResult.servicesCount === 0 && <li>• Add at least one active service to enable bookings</li>}
                {!testResult.urlAccessible && <li>• Check URL format and ensure proper routing</li>}
                {getOverallStatus() === 'pass' && <li>• ✅ QR code is ready for use!</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
