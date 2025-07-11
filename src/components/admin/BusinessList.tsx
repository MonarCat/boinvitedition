
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface BusinessProfile {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface BusinessData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  currency: string | null;
  user_id: string;
  profiles: BusinessProfile;
}

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          email,
          phone,
          city,
          country,
          is_active,
          is_verified,
          created_at,
          currency,
          user_id
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately for each business
      const businessesWithProfiles = await Promise.all(
        data.map(async (business) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', business.user_id)
            .single();
          
          return {
            ...business,
            profiles: profile || { email: '', first_name: null, last_name: null }
          };
        })
      );
      
      return businessesWithProfiles as BusinessData[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading businesses...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p>Error loading businesses: {(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Business Accounts
          <Badge variant="outline">
            {businesses?.length || 0} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Business Name</th>
                <th className="text-left p-2">Owner</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses?.map((business) => (
                <tr key={business.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{business.name}</div>
                      <div className="text-sm text-gray-500">{business.email}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div>
                      <div className="text-sm">
                        {business.profiles?.first_name} {business.profiles?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {business.profiles?.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      {business.city && business.country 
                        ? `${business.city}, ${business.country}`
                        : 'Not specified'
                      }
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={business.is_active ? "default" : "destructive"}
                        className="w-fit"
                      >
                        {business.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {business.is_verified && (
                        <Badge variant="outline" className="w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="p-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedBusiness(business.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {businesses?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No businesses found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
