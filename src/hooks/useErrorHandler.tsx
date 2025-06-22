
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const handleError = useCallback((error: any, context?: string) => {
    console.error('Error in', context || 'application', ':', error);

    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    // Handle Supabase errors
    if (error?.message) {
      errorMessage = error.message;
      errorCode = error.code || 'SUPABASE_ERROR';
    }

    // Handle network errors
    if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
      errorMessage = 'Network connection error. Please check your internet connection.';
      errorCode = 'NETWORK_ERROR';
    }

    // Handle authentication errors
    if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
      errorMessage = 'Authentication error. Please sign in again.';
      errorCode = 'AUTH_ERROR';
    }

    // Handle validation errors
    if (error?.message?.includes('validation') || error?.code === 'VALIDATION_ERROR') {
      errorMessage = 'Please check your input and try again.';
      errorCode = 'VALIDATION_ERROR';
    }

    // Handle permission errors
    if (error?.message?.includes('permission') || error?.message?.includes('RLS')) {
      errorMessage = 'You do not have permission to perform this action.';
      errorCode = 'PERMISSION_ERROR';
    }

    const errorInfo: ErrorInfo = {
      message: errorMessage,
      code: errorCode,
      details: error,
      timestamp: new Date()
    };

    setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors
    
    // Show user-friendly toast notification
    toast.error(errorMessage);

    // Log to external service in production (optional)
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      console.warn('Production error logged:', {
        message: errorMessage,
        code: errorCode,
        timestamp: errorInfo.timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    return errorInfo;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return {
    errors,
    handleError,
    clearErrors,
    handleAsyncError
  };
};
