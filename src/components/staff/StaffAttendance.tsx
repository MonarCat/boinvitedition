import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { submitAttendance } from '@/lib/offlineAttendance';
import { OfflineAttendanceIndicator } from './OfflineAttendanceIndicator';
import { ExportButton } from '@/components/ui/ExportButton';
import { useAttendanceExport } from '@/hooks/useAttendanceExport';

export const StaffAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [signInNotes, setSignInNotes] = useState('');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { isExporting, exportAttendanceRecords } = useAttendanceExport(business?.id || '');

  const { data: staff } = useQuery({
    queryKey: ['staff', business?.id],
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

  const { data: attendanceRecords } = useQuery({
    queryKey: ['staff-attendance', business?.id, selectedDate],
    queryFn: async () => {
      if (!business) return [];
      
      const { data, error } = await supabase
        .from('staff_attendance')
        .select(`
          *,
          staff:staff_id(name, email)
        `)
        .eq('business_id', business.id)
        .eq('attendance_date', selectedDate)
        .order('sign_in_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const signOutMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      const { error } = await supabase
        .from('staff_attendance')
        .update({
          sign_out_time: new Date().toISOString(),
          status: 'signed_out'
        })
        .eq('id', attendanceId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff member signed out successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
    onError: () => {
      toast.error('Failed to sign out staff member');
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ staffId, notes }: { staffId: string; notes?: string }) => {
      if (!business) throw new Error('No business found');

      // Use the enhanced offline-capable function
      const result = await submitAttendance(staffId, business.id, 'signed_in', notes);
      
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      if (!result.offline) {
        toast.success('Staff member signed in successfully');
        queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
      }
      setSignInNotes('');
    },
    onError: (error: any) => {
      // Don't show error toast here as submitAttendance already handles it
      console.error('Sign-in error:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed_in':
        return 'bg-green-100 text-green-800';
      case 'signed_out':
        return 'bg-gray-100 text-gray-800';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodaysAttendance = (staffId: string) => {
    return attendanceRecords?.find(
      record => record.staff_id === staffId && record.status === 'signed_in'
    );
  };

  const handleExport = () => {
    exportAttendanceRecords(exportStartDate || undefined, exportEndDate || undefined);
  };

  if (!staff || staff.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active staff members</h3>
          <p className="text-gray-600">Add staff members to start tracking attendance.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Label htmlFor="date">Date:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        
        <OfflineAttendanceIndicator />
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="export-start">From:</Label>
              <Input
                id="export-start"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="export-end">To:</Label>
              <Input
                id="export-end"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              label="Attendance"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave dates empty to export all records
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.map((member) => {
          const todaysAttendance = getTodaysAttendance(member.id);
          const isSignedIn = !!todaysAttendance;

          return (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <Badge className={getStatusColor(todaysAttendance?.status || 'signed_out')}>
                    {todaysAttendance?.status.replace('_', ' ') || 'Not signed in'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {todaysAttendance && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Sign in: {format(new Date(todaysAttendance.sign_in_time), 'HH:mm')}
                    </div>
                    {todaysAttendance.sign_out_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        Sign out: {format(new Date(todaysAttendance.sign_out_time), 'HH:mm')}
                      </div>
                    )}
                    {todaysAttendance.notes && (
                      <div className="text-sm text-gray-600">
                        Notes: {todaysAttendance.notes}
                      </div>
                    )}
                    {todaysAttendance.geolocation && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        Location tracked
                      </div>
                    )}
                  </div>
                )}

                {!isSignedIn ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Notes (optional)"
                      value={signInNotes}
                      onChange={(e) => setSignInNotes(e.target.value)}
                    />
                    <Button
                      onClick={() => signInMutation.mutate({ 
                        staffId: member.id, 
                        notes: signInNotes 
                      })}
                      disabled={signInMutation.isPending}
                      className="w-full"
                    >
                      {signInMutation.isPending ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </div>
                ) : (
                  todaysAttendance.status === 'signed_in' && (
                    <Button
                      onClick={() => signOutMutation.mutate(todaysAttendance.id)}
                      disabled={signOutMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {signOutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Attendance Summary */}
      {attendanceRecords && attendanceRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{record.staff?.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(record.sign_in_time), 'HH:mm')}
                      {record.sign_out_time && ` - ${format(new Date(record.sign_out_time), 'HH:mm')}`}
                    </p>
                    {record.ip_address && (
                      <p className="text-xs text-gray-500">IP: {record.ip_address}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                    {record.geolocation && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-2 w-2 mr-1" />
                        Located
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
