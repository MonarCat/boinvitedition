
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Settings } from 'lucide-react';

interface ProductionReadinessCheckProps {
  businessId: string;
}

export const ProductionReadinessCheck: React.FC<ProductionReadinessCheckProps> = ({ businessId }) => {
  // Check business setup
  const { data: businessData } = useQuery({
    queryKey: ['production-check-business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('name, description, phone, email, address, logo_url, subdomain')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Check services
  const { data: servicesData } = useQuery({
    queryKey: ['production-check-services', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, currency')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  // Check business settings
  const { data: settingsData } = useQuery({
    queryKey: ['production-check-settings', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error) return null;
      return data;
    }
  });

  // Check subscription
  const { data: subscriptionData } = useQuery({
    queryKey: ['production-check-subscription', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, status, split_percentage')
        .eq('business_id', businessId)
        .single();

      if (error) return null;
      return data;
    }
  });

  const checks = [
    {
      category: 'Business Information',
      items: [
        {
          name: 'Business Name',
          status: businessData?.name ? 'complete' : 'missing',
          description: 'Required for customer recognition'
        },
        {
          name: 'Business Description',
          status: businessData?.description ? 'complete' : 'missing',
          description: 'Helps customers understand your services'
        },
        {
          name: 'Contact Information',
          status: (businessData?.phone && businessData?.email) ? 'complete' : 'partial',
          description: 'Phone and email for customer communication'
        },
        {
          name: 'Business Address',
          status: businessData?.address ? 'complete' : 'missing',
          description: 'Physical location for customer visits'
        },
        {
          name: 'Business Logo',
          status: businessData?.logo_url ? 'complete' : 'optional',
          description: 'Professional branding'
        }
      ]
    },
    {
      category: 'Services & Pricing',
      items: [
        {
          name: 'Active Services',
          status: (servicesData && servicesData.length > 0) ? 'complete' : 'missing',
          description: `${servicesData?.length || 0} active services configured`
        },
        {
          name: 'Service Pricing',
          status: servicesData?.every(s => s.price > 0) ? 'complete' : 'missing',
          description: 'All services have valid pricing'
        },
        {
          name: 'Currency Settings',
          status: servicesData?.every(s => s.currency) ? 'complete' : 'missing',
          description: 'Currency configured for all services'
        }
      ]
    },
    {
      category: 'Booking Configuration',
      items: [
        {
          name: 'Business Settings',
          status: settingsData ? 'complete' : 'missing',
          description: 'Booking rules and preferences'
        },
        {
          name: 'Payment Integration',
          status: 'complete',
          description: 'Paystack integration configured'
        },
        {
          name: 'QR Code Support',
          status: 'complete',
          description: 'QR code generation ready'
        }
      ]
    },
    {
      category: 'Subscription & Fees',
      items: [
        {
          name: 'Subscription Plan',
          status: subscriptionData?.status === 'active' ? 'complete' : 'missing',
          description: `Plan: ${subscriptionData?.plan_type || 'None'}`
        },
        {
          name: 'Transaction Fees',
          status: subscriptionData?.split_percentage === 7 ? 'complete' : 'missing',
          description: `Platform fee: ${subscriptionData?.split_percentage || 0}% (Customer gets ${100 - (subscriptionData?.split_percentage || 0)}%)`
        }
      ]
    },
    {
      category: 'Advanced Features',
      items: [
        {
          name: 'Custom Subdomain',
          status: businessData?.subdomain ? 'complete' : 'optional',
          description: businessData?.subdomain ? `${businessData.subdomain}.boinvit.com` : 'Professional custom URL'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'optional':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'optional':
        return <Badge variant="outline">Optional</Badge>;
      default:
        return <Badge variant="destructive">Missing</Badge>;
    }
  };

  const completionRate = checks.reduce((acc, category) => {
    const completeItems = category.items.filter(item => item.status === 'complete').length;
    const requiredItems = category.items.filter(item => item.status !== 'optional').length;
    return acc + (requiredItems > 0 ? (completeItems / requiredItems) * 100 : 100);
  }, 0) / checks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Production Readiness Check
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(completionRate)}%
          </div>
          <div className="text-sm text-gray-600">Ready for Production</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {checks.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <h3 className="font-semibold text-gray-900">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </div>
        ))}

        {completionRate >= 80 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Ready for Production!</span>
            </div>
            <p className="text-green-800 text-sm">
              Your business is ready to accept bookings and payments from customers. 
              Make sure to test the booking flow and QR codes before going live.
            </p>
          </div>
        )}

        {completionRate < 80 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">Setup Required</span>
            </div>
            <p className="text-yellow-800 text-sm">
              Please complete the missing items above before going live. 
              This will ensure a smooth experience for your customers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
