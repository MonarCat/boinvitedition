
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isPaymentFlow?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If there's an onError handler, call it
    this.props.onError?.(error, errorInfo);
    
    // If this is a payment flow, log additional info
    if (this.props.isPaymentFlow) {
      console.error('Payment flow error details:', {
        timestamp: new Date().toISOString(),
        componentStack: errorInfo.componentStack
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={`mx-auto max-w-md mt-8 ${this.props.isPaymentFlow ? 'border-red-200 bg-red-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              {this.props.isPaymentFlow ? 
                <AlertTriangle className="h-5 w-5" /> : 
                <AlertCircle className="h-5 w-5" />
              }
              {this.props.isPaymentFlow ? 'Payment Error' : 'Something went wrong'}
            </CardTitle>
            {this.props.isPaymentFlow && (
              <CardDescription className="text-red-700">
                We encountered an issue while processing your payment. This is likely temporary.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {this.props.isPaymentFlow 
                ? "Your payment was not processed. This could be due to a network issue or temporary system problem."
                : "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-100 p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
              </details>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry} 
                className="flex items-center gap-2"
                variant={this.props.isPaymentFlow ? "default" : "secondary"}
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              {this.props.isPaymentFlow && (
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
