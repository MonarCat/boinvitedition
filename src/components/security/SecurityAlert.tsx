
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Info, X } from 'lucide-react';

interface SecurityAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

export const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  message,
  severity = 'medium',
  onDismiss,
  actions
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Alert variant={getVariant() as any} className="relative">
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
          <Badge className={`text-xs ${getSeverityColor()}`}>
            {severity.toUpperCase()}
          </Badge>
        </div>
        <AlertDescription className="text-sm">
          {message}
        </AlertDescription>
        {actions && (
          <div className="mt-3">
            {actions}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Alert>
  );
};
