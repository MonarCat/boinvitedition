
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface AttendanceAnalyticsProps {
  businessId: string;
}

export const AttendanceAnalytics = ({ businessId }: AttendanceAnalyticsProps) => {
  const { data: analytics } = useQuery({
    queryKey: ['attendance-analytics', businessId],
    queryFn: async () => {
      const startDate = startOfWeek(new Date()).toISOString().split('T')[0];
      const endDate = endOfWeek(new Date()).toISOString().split('T')[0];

      // Get this week's attendance
      const { data: weeklyAttendance, error: weeklyError } = await supabase
        .from('staff_attendance')
        .select(`
          *,
          staff:staff_id(name)
        `)
        .eq('business_id', businessId)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (weeklyError) throw weeklyError;

      // Get suspicious activities
      const { data: alerts, error: alertsError } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      return {
        weeklyAttendance: weeklyAttendance || [],
        alerts: alerts || []
      };
    },
    enabled: !!businessId,
  });

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  const totalSignIns = analytics.weeklyAttendance.filter(a => a.status === 'signed_in').length;
  const uniqueStaffCount = new Set(analytics.weeklyAttendance.map(a => a.staff_id)).size;
  const alertsThisWeek = analytics.alerts.length;
  const outsideHoursSignins = analytics.alerts.filter(a => a.alert_type === 'OUTSIDE_HOURS_SIGNIN').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Total Sign-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSignIns}</div>
          <p className="text-xs text-gray-600">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueStaffCount}</div>
          <p className="text-xs text-gray-600">Unique staff members</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{alertsThisWeek}</div>
          <p className="text-xs text-gray-600">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Outside Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{outsideHoursSignins}</div>
          <p className="text-xs text-gray-600">Sign-ins after hours</p>
        </CardContent>
      </Card>
    </div>
  );
};
