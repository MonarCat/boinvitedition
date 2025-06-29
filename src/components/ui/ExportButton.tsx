
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onExport: (format: 'csv' | 'excel' | 'json') => void;
  isExporting: boolean;
  label: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExport, 
  isExporting, 
  label 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'json'>('excel');

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    console.log(`Export button clicked for ${label} in ${format} format`);
    setSelectedFormat(format);
    onExport(format);
  };

  const formatLabels = {
    excel: 'Excel (Mobile Friendly)',
    csv: 'CSV',
    json: 'JSON'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? `Exporting ${label}...` : `Export ${label}`}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('excel')} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {formatLabels.excel}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {formatLabels.csv}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {formatLabels.json}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
