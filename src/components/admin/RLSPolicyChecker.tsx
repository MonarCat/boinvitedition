
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const RLSPolicyChecker = () => {
  const { data: policyStatus, isLoading } = useQuery({
    queryKey: ['rls-policy-status'],
    queryFn: async () => {
      // Test various table access patterns to verify RLS policies
      const tests = [];
      
      try {
        // Test bookings access
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, business_id, status')
          .limit(1);
        
        tests.push({
          table: 'bookings',
          status: bookingsError ? 'error' : 'success',
          message: bookingsError?.message || 'Access granted',
          records: bookings?.length || 0
        });

        // Test businesses access
        const { data: businesses, error: businessesError } = await supabase
          .from('businesses')
          .select('id, name, user_id')
          .limit(1);
        
        tests.push({
          table: 'businesses',
          status: businessesError ? 'error' : 'success',
          message: businessesError?.message || 'Access granted',
          records: businesses?.length || 0
        });

        // Test client_business_transactions access
        const { data: transactions, error: transactionsError } = await supabase
          .from('client_business_transactions')
          .select('id, business_id, status')
          .limit(1);
        
        tests.push({
          table: 'client_business_transactions',
          status: transactionsError ? 'error' : 'success',
          message: transactionsError?.message || 'Access granted',
          records: transactions?.length || 0
        });

        // Test services access
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, business_id, name')
          .limit(1);
        
        tests.push({
          table: 'services',
          status: servicesError ? 'error' : 'success',
          message: servicesError?.message || 'Access granted',
          records: services?.length || 0
        });

        // Test staff access
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('id, business_id, name')
          .limit(1);
        
        tests.push({
          table: 'staff',
          status: staffError ? 'error' : 'success',
          message: staffError?.message || 'Access granted',
          records: staff?.length || 0
        });

      } catch (error) {
        console.error('RLS Policy check failed:', error);
      }

      return tests;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            RLS Policy Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          RLS Policy Status Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {policyStatus?.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <h4 className="font-medium">{test.table}</h4>
                  <p className="text-sm text-gray-600">{test.message}</p>
                  <p className="text-xs text-gray-500">Records accessible: {test.records}</p>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">RLS Policy Guidelines:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Business owners should only see their own data</li>
            <li>• Clients should only see their own bookings via email</li>
            <li>• Transactions should be filtered by business ownership</li>
            <li>• Admin users can see all data across businesses</li>
            <li>• Public users can view active services and businesses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
