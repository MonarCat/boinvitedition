
import React, { ReactNode } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { validateAndSanitizeInput } from '@/utils/securityUtils';
import { toast } from 'sonner';

interface SecureFormWrapperProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  businessId?: string;
  formType: string;
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  businessId,
  formType
}) => {
  const { logSecurityEvent } = useSecurityMonitoring();

  const handleSecureSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const data: Record<string, any> = {};
    let hasErrors = false;

    // Validate and sanitize all form inputs
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        const validation = validateAndSanitizeInput(value, {
          maxLength: key === 'description' ? 1000 : 255,
          required: key === 'name' || key === 'email',
          allowHTML: key === 'description'
        });

        if (!validation.isValid) {
          toast.error(`${key}: ${validation.errors.join(', ')}`);
          hasErrors = true;
          
          // Log security event for invalid input
          await logSecurityEvent('INVALID_FORM_INPUT', `Invalid input detected in ${formType}`, {
            form_type: formType,
            field: key,
            errors: validation.errors,
            business_id: businessId
          });
        } else {
          data[key] = validation.sanitized;
        }
      } else {
        data[key] = value;
      }
    }

    if (hasErrors) {
      return;
    }

    // Log successful form submission
    await logSecurityEvent('SECURE_FORM_SUBMISSION', `Secure form submission: ${formType}`, {
      form_type: formType,
      business_id: businessId,
      fields: Object.keys(data)
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSecureSubmit} className="space-y-4">
      {children}
    </form>
  );
};
