
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMobileFriendlyExport = (businessId: string) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToFormat = (data: any[], filename: string, format: 'csv' | 'excel' | 'json') => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    console.log(`Exporting ${data.length} records to ${format.toUpperCase()} for ${filename}`);

    switch (format) {
      case 'csv':
        exportToCSV(data, filename);
        break;
      case 'excel':
        exportToExcel(data, filename);
        break;
      case 'json':
        exportToJSON(data, filename);
        break;
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
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

    downloadFile(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Create a simple HTML table that Excel can open
    const headers = Object.keys(data[0]);
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>
                  ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    downloadFile(htmlContent, `${filename}_${new Date().toISOString().split('T')[0]}.xls`, 'application/vnd.ms-excel');
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportBookings = async (format: 'csv' | 'excel' | 'json' = 'excel') => {
    console.log('Starting bookings export for business:', businessId);
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          payment_status,
          total_amount,
          customer_name,
          customer_email,
          customer_phone,
          ticket_code,
          created_at,
          services(name),
          clients(name),
          staff(name)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = data?.map(booking => ({
        'Booking ID': booking.id,
        'Date': booking.booking_date,
        'Time': booking.booking_time,
        'Status': booking.status,
        'Payment Status': booking.payment_status,
        'Amount': booking.total_amount,
        'Customer Name': booking.customer_name,
        'Customer Email': booking.customer_email,
        'Customer Phone': booking.customer_phone,
        'Ticket Code': booking.ticket_code,
        'Service': booking.services?.name || 'N/A',
        'Client': booking.clients?.name || 'N/A',
        'Staff': booking.staff?.name || 'N/A',
        'Created At': booking.created_at
      })) || [];

      exportToFormat(exportData, 'bookings', format);
      toast.success(`Bookings exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  const exportClients = async (format: 'csv' | 'excel' | 'json' = 'excel') => {
    console.log('Starting clients export for business:', businessId);
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = data?.map(client => ({
        'Client ID': client.id,
        'Name': client.name,
        'Email': client.email,
        'Phone': client.phone,
        'Address': client.address,
        'Notes': client.notes,
        'Last Service Date': client.last_service_date,
        'Created At': client.created_at
      })) || [];

      exportToFormat(exportData, 'clients', format);
      toast.success(`Clients exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error exporting clients:', error);
      toast.error('Failed to export clients');
    } finally {
      setIsExporting(false);
    }
  };

  const exportStaff = async (format: 'csv' | 'excel' | 'json' = 'excel') => {
    console.log('Starting staff export for business:', businessId);
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = data?.map(staff => ({
        'Staff ID': staff.id,
        'Name': staff.name,
        'Email': staff.email,
        'Phone': staff.phone,
        'Gender': staff.gender,
        'Shift': staff.shift,
        'Workload': staff.workload,
        'Specialties': Array.isArray(staff.specialties) ? staff.specialties.join(', ') : staff.specialties,
        'Active': staff.is_active ? 'Yes' : 'No',
        'Created At': staff.created_at
      })) || [];

      exportToFormat(exportData, 'staff', format);
      toast.success(`Staff exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error exporting staff:', error);
      toast.error('Failed to export staff');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportBookings,
    exportClients,
    exportStaff
  };
};
