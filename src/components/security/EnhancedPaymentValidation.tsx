
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface PaymentValidationResult {
  valid: boolean;
  warnings: string[];
  flags: string[];
}

interface EnhancedPaymentValidationProps {
  amount: number;
  businessId: string;
  paymentMethod?: string;
  onValidationResult: (result: PaymentValidationResult) => void;
}

export const EnhancedPaymentValidation: React.FC<EnhancedPaymentValidationProps> = ({
  amount,
  businessId,
  paymentMethod,
  onValidationResult
}) => {
  const [validationResult, setValidationResult] = useState<PaymentValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { logSecurityEvent } = useSecurityMonitoring();

  const validatePayment = async () => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.rpc('validate_payment_security_enhanced', {
        p_amount: amount,
        p_business_id: businessId,
        p_payment_method: paymentMethod
      });

      if (error) {
        throw error;
      }

      const result = data as PaymentValidationResult;
      setValidationResult(result);
      onValidationResult(result);

      // Log security events for high-value or flagged transactions
      if (amount > 100000 || result.flags.length > 0) {
        await logSecurityEvent('PAYMENT_SECURITY_VALIDATION', 'Payment security validation performed', {
          amount,
          business_id: businessId,
          payment_method: paymentMethod,
          validation_result: result
        });
      }

    } catch (error) {
      console.error('Payment validation error:', error);
      await logSecurityEvent('PAYMENT_VALIDATION_ERROR', 'Payment validation failed', {
        amount,
        business_id: businessId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const fallbackResult: PaymentValidationResult = {
        valid: false,
        warnings: ['Validation service unavailable'],
        flags: ['System error']
      };
      setValidationResult(fallbackResult);
      onValidationResult(fallbackResult);
    } finally {
      setIsValidating(false);
    }
  };

  React.useEffect(() => {
    if (amount > 0 && businessId) {
      validatePayment();
    }
  }, [amount, businessId, paymentMethod]);

  if (isValidating) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>Validating payment security...</AlertDescription>
      </Alert>
    );
  }

  if (!validationResult) {
    return null;
  }

  return (
    <div className="space-y-2">
      {!validationResult.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Payment validation failed: {validationResult.warnings.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {validationResult.warnings.length > 0 && validationResult.valid && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Security warnings: {validationResult.warnings.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {validationResult.flags.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Security flags: {validationResult.flags.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {validationResult.valid && validationResult.warnings.length === 0 && validationResult.flags.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment validation successful
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
