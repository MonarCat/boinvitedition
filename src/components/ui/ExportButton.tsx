
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  label: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExport, 
  isExporting, 
  label 
}) => {
  return (
    <Button
      onClick={onExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
    >
      <Download className="w-4 h-4 mr-2" />
      {isExporting ? 'Exporting...' : `Export ${label}`}
    </Button>
  );
};
