
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedAttendanceForm } from '@/components/staff/EnhancedAttendanceForm';
import { AdminAlerts } from '@/components/staff/AdminAlerts';
import { AttendanceAnalytics } from '@/components/staff/AttendanceAnalytics';
import { StaffAttendance } from '@/components/staff/StaffAttendance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, BarChart3, Users, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const EnhancedStaffAttendancePage = () => {
  const { user } = useAuth();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: staff } = useQuery({
    queryKey: ['active-staff', business?.id],
    queryFn: async () => {
      if (!business) return [];
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const filteredStaff = staff?.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Staff Attendance</h1>
          <p className="text-gray-600">Digital work register with offline support and fraud detection</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="quick-signin" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quick Sign-in
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <StaffAttendance />
          </TabsContent>

          <TabsContent value="quick-signin" className="space-y-6">
            {business && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Staff Sign-in/Sign-out</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <Input
                        placeholder="Search staff by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {!filteredStaff.length ? (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No staff found matching your search' : 'No active staff members'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStaff.map((member) => (
                          <Card 
                            key={member.id} 
                            className={`cursor-pointer transition-all ${
                              selectedStaff?.id === member.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setSelectedStaff(member)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{member.name}</h3>
                                {member.shift && (
                                  <Badge variant="outline">{member.shift}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{member.email}</p>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedStaff && (
                  <EnhancedAttendanceForm
                    staff={selectedStaff}
                    businessId={business.id}
                    onSuccess={() => setSelectedStaff(null)}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="security">
            <AdminAlerts />
          </TabsContent>

          <TabsContent value="analytics">
            {business && <AttendanceAnalytics businessId={business.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedStaffAttendancePage;
