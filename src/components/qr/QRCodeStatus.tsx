
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface QRCodeStatusProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
  isValidating: boolean;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const QRCodeStatus: React.FC<QRCodeStatusProps> = ({
  validationStatus,
  isValidating,
  isGenerating,
  onRegenerate
}) => {
  const getStatusBadge = () => {
    if (isValidating || isGenerating) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          {isValidating ? 'Validating...' : 'Generating...'}
        </Badge>
      );
    }
    
    switch (validationStatus) {
      case 'valid':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Invalid
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {getStatusBadge()}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRegenerate}
        disabled={isValidating || isGenerating}
        className="h-6 px-2"
      >
        <RefreshCw className={`w-3 h-3 ${(isValidating || isGenerating) ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
