
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useAttendanceExport = (businessId: string) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    console.log(`Exporting ${data.length} attendance records to CSV`);

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`CSV export completed for ${filename}`);
  };

  const exportAttendanceRecords = async (startDate?: string, endDate?: string) => {
    console.log('Starting attendance export for business:', businessId);
    setIsExporting(true);
    
    try {
      let query = supabase
        .from('staff_attendance')
        .select(`
          id,
          attendance_date,
          sign_in_time,
          sign_out_time,
          status,
          notes,
          ip_address,
          geolocation,
          staff:staff_id(name, email)
        `)
        .eq('business_id', businessId)
        .order('attendance_date', { ascending: false })
        .order('sign_in_time', { ascending: false });

      if (startDate) {
        query = query.gte('attendance_date', startDate);
      }
      if (endDate) {
        query = query.lte('attendance_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const exportData = data?.map(record => ({
        'Attendance ID': record.id,
        'Date': record.attendance_date,
        'Sign In Time': record.sign_in_time ? format(new Date(record.sign_in_time), 'HH:mm:ss') : '',
        'Sign Out Time': record.sign_out_time ? format(new Date(record.sign_out_time), 'HH:mm:ss') : '',
        'Status': record.status,
        'Staff Name': record.staff?.name || 'N/A',
        'Staff Email': record.staff?.email || 'N/A',
        'Notes': record.notes || '',
        'IP Address': record.ip_address || '',
        'Location Tracked': record.geolocation ? 'Yes' : 'No'
      })) || [];

      const dateRange = startDate && endDate ? `${startDate}_to_${endDate}` : 'all_records';
      exportToCSV(exportData, `attendance_records_${dateRange}`);
      toast.success('Attendance records exported successfully');
    } catch (error: any) {
      console.error('Error exporting attendance records:', error);
      toast.error('Failed to export attendance records');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportAttendanceRecords
  };
};
