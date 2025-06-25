
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/ui/ExportButton';
import { Download } from 'lucide-react';
import { useSpreadsheetExport } from '@/hooks/useSpreadsheetExport';

interface DashboardExportSectionProps {
  businessId: string;
}

export const DashboardExportSection: React.FC<DashboardExportSectionProps> = ({
  businessId
}) => {
  const { isExporting, exportBookings, exportClients, exportStaff } = useSpreadsheetExport(businessId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ExportButton
          onExport={exportBookings}
          isExporting={isExporting}
          label="Bookings"
        />
        <ExportButton
          onExport={exportClients}
          isExporting={isExporting}
          label="Clients"
        />
        <ExportButton
          onExport={exportStaff}
          isExporting={isExporting}
          label="Staff"
        />
      </CardContent>
    </Card>
  );
};
