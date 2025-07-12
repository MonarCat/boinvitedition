import React, { ReactNode } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { validateInputSecure, getSecurityHeaders } from '@/utils/enhancedSecurityUtils';
import { toast } from 'sonner';

interface EnhancedCSRFFormProps {
  children: ReactNode;
  onSubmit: (formData: FormData, csrfToken: string) => Promise<void>;
  className?: string;
  validateInputs?: boolean;
}

export const EnhancedCSRFForm: React.FC<EnhancedCSRFFormProps> = ({
  children,
  onSubmit,
  className = '',
  validateInputs = true
}) => {
  const { csrfToken, validateCSRFToken } = useCSRFProtection();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate CSRF token
    if (!validateCSRFToken(csrfToken)) {
      toast.error('Security validation failed. Please refresh the page.');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    // Enhanced input validation if enabled
    if (validateInputs) {
      const inputs = Array.from(formData.entries());
      let hasValidationErrors = false;
      
      for (const [key, value] of inputs) {
        if (typeof value === 'string' && value.trim()) {
          // Determine field type based on name
          let fieldType: 'email' | 'phone' | 'text' | 'url' = 'text';
          if (key.toLowerCase().includes('email')) fieldType = 'email';
          else if (key.toLowerCase().includes('phone')) fieldType = 'phone';
          else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) fieldType = 'url';
          
          const validation = validateInputSecure(value, fieldType);
          
          if (!validation.isValid) {
            toast.error(`${key}: ${validation.errors.join(', ')}`);
            hasValidationErrors = true;
          } else {
            // Replace with sanitized value
            formData.set(key, validation.sanitized);
          }
        }
      }
      
      if (hasValidationErrors) {
        return;
      }
    }
    
    try {
      await onSubmit(formData, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Form submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <input type="hidden" name="csrf_token" value={csrfToken} />
    </form>
  );
};