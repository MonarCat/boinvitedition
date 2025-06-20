
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Globe, Check, AlertCircle } from 'lucide-react';

interface SubdomainSettingsProps {
  businessId: string;
}

export const SubdomainSettings: React.FC<SubdomainSettingsProps> = ({ businessId }) => {
  const [subdomain, setSubdomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current subdomain
  const { data: business, isLoading } = useQuery({
    queryKey: ['business-subdomain-settings', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('subdomain, name')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId
  });

  // Update subdomain mutation
  const updateSubdomainMutation = useMutation({
    mutationFn: async (newSubdomain: string) => {
      const { error } = await supabase
        .from('businesses')
        .update({ subdomain: newSubdomain })
        .eq('id', businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subdomain-settings', businessId] });
      toast.success('Subdomain updated successfully!');
      setSubdomain('');
    },
    onError: (error) => {
      console.error('Subdomain update error:', error);
      toast.error('Failed to update subdomain. It may already be taken.');
    }
  });

  const checkSubdomainAvailability = async () => {
    if (!subdomain.trim()) {
      toast.error('Please enter a subdomain');
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (subdomain.length < 3 || subdomain.length > 63 || !subdomainRegex.test(subdomain)) {
      toast.error('Subdomain must be 3-63 characters, contain only lowercase letters, numbers, and hyphens, and not start or end with a hyphen');
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('subdomain', subdomain)
        .neq('id', businessId);

      if (error) throw error;

      if (data && data.length > 0) {
        toast.error('This subdomain is already taken');
      } else {
        toast.success('Subdomain is available!');
      }
    } catch (error) {
      console.error('Subdomain check error:', error);
      toast.error('Failed to check subdomain availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveSubdomain = () => {
    if (!subdomain.trim()) {
      toast.error('Please enter a subdomain');
      return;
    }

    updateSubdomainMutation.mutate(subdomain);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Custom Domain Settings
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set up a custom subdomain for your booking page to make it easier for customers to find you
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {business?.subdomain && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Current Subdomain</span>
            </div>
            <p className="text-green-800">
              Your booking page: <strong>{business.subdomain}.boinvit.com</strong>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="subdomain">Custom Subdomain</Label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1 flex">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  placeholder="your-business-name"
                  className="rounded-r-none"
                />
                <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md text-sm text-gray-600 flex items-center">
                  .boinvit.com
                </div>
              </div>
              <Button
                onClick={checkSubdomainAvailability}
                disabled={isChecking || !subdomain.trim()}
                variant="outline"
                size="sm"
              >
                {isChecking ? 'Checking...' : 'Check'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use lowercase letters, numbers, and hyphens only. Must be 3-63 characters.
            </p>
          </div>

          <Button
            onClick={handleSaveSubdomain}
            disabled={updateSubdomainMutation.isPending || !subdomain.trim()}
            className="w-full"
          >
            {updateSubdomainMutation.isPending ? 'Saving...' : 'Save Subdomain'}
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Benefits of Custom Subdomain:</p>
              <ul className="text-blue-800 space-y-1">
                <li>• Easier to remember and share</li>
                <li>• Professional branding</li>
                <li>• Better for QR codes and marketing</li>
                <li>• Improved customer trust</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
