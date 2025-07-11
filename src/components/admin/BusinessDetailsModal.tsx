import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/formatCurrency';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  CreditCard,
  TrendingUp
} from 'lucide-react';

interface BusinessDetailsModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  currency: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  user_id: string;
}

interface BusinessStats {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalServices: number;
  totalStaff: number;
  recentTransactions: any[];
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  businessId,
  isOpen,
  onClose
}) => {
  // Fetch business details
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['business-details', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as BusinessDetails;
    },
    enabled: isOpen && !!businessId
  });

  // Fetch business owner profile
  const { data: owner } = useQuery({
    queryKey: ['business-owner', business?.user_id],
    queryFn: async () => {
      if (!business?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', business.user_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!business?.user_id
  });

  // Fetch business statistics
  const { data: stats } = useQuery({
    queryKey: ['business-stats', businessId],
    queryFn: async () => {
      // Get bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', businessId);

      // Get transactions
      const { data: transactions } = await supabase
        .from('client_business_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId);

      // Get staff
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId);

      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return {
        totalBookings: bookings?.length || 0,
        completedBookings: completedBookings.length,
        totalRevenue,
        totalServices: services?.length || 0,
        totalStaff: staff?.length || 0,
        recentTransactions: transactions?.slice(0, 5) || []
      };
    },
    enabled: isOpen && !!businessId
  });

  const handleViewPublicPage = () => {
    if (businessId) {
      window.open(`/public-booking/${businessId}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Details
          </DialogTitle>
        </DialogHeader>

        {businessLoading ? (
          <div className="text-center py-8">Loading business details...</div>
        ) : business ? (
          <div className="space-y-6">
            {/* Business Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {business.name}
                      {business.is_verified && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant={business.is_active ? "default" : "destructive"}>
                        {business.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {business.description || 'No description provided'}
                    </p>
                  </div>
                  <Button onClick={handleViewPublicPage} variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {business.email || 'Not provided'}</p>
                      <p><strong>Phone:</strong> {business.phone || 'Not provided'}</p>
                      <p><strong>Website:</strong> {business.website || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {business.address || 'Not provided'}</p>
                      <p><strong>City:</strong> {business.city || 'Not provided'}</p>
                      <p><strong>Country:</strong> {business.country || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Owner */}
            {owner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Business Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {owner.first_name} {owner.last_name}</p>
                    <p><strong>Email:</strong> {owner.email}</p>
                    <div className="flex items-center gap-2">
                      <strong>Role:</strong> 
                      {owner.is_admin && (
                        <Badge variant="default">Platform Admin</Badge>
                      )}
                      <Badge variant="outline">Business Owner</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
                      <p className="text-xs text-gray-600">Total Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.completedBookings || 0}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                      <p className="text-xs text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalStaff || 0}</p>
                      <p className="text-xs text-gray-600">Staff Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentTransactions?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No transactions found</p>
                ) : (
                  <div className="space-y-2">
                    {stats?.recentTransactions?.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(Number(transaction.amount))}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Currency:</strong> {business.currency || 'USD'}</p>
                    <p><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(business.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>
                        {business.average_rating ? `${business.average_rating}/5` : 'No ratings'} 
                        ({business.total_reviews || 0} reviews)
                      </span>
                    </div>
                    <p><strong>Services:</strong> {stats?.totalServices || 0} active services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p>Business not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};