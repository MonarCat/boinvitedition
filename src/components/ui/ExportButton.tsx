
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
  const handleClick = () => {
    console.log(`Export button clicked for ${label}`);
    onExport();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {isExporting ? `Exporting ${label}...` : `Export ${label}`}
    </Button>
  );
};
