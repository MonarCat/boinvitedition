
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PaymentErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const PaymentErrorHandler: React.FC<PaymentErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Payment Error</AlertTitle>
      <AlertDescription className="mt-2">
        {error}
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="text-red-700 hover:bg-red-50"
          >
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  );
};
