
import React, { useState, useEffect } from 'react';
import { sanitizeInput, validateEmail, sanitizePhoneNumber, validatePhoneNumber } from '@/utils/enhancedSecurityUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  validationRules?: {
    email?: boolean;
    phone?: boolean;
    required?: string[];
  };
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  validationRules = {}
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    // Check if we're on HTTPS in production
    const isHttps = window.location.protocol === 'https:';
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecure(isHttps || isDev);
  }, []);

  const validateAndSanitizeFormData = (formData: FormData): { isValid: boolean; sanitizedData: any; errors: string[] } => {
    const errors: string[] = [];
    const sanitizedData: any = {};

    // Convert FormData to object and sanitize
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeInput(value);
      } else {
        sanitizedData[key] = value; // File uploads, etc.
      }
    }

    // Required field validation
    if (validationRules.required) {
      for (const field of validationRules.required) {
        if (!sanitizedData[field] || sanitizedData[field].trim() === '') {
          errors.push(`${field} is required`);
        }
      }
    }

    // Email validation
    if (validationRules.email && sanitizedData.email) {
      if (!validateEmail(sanitizedData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Phone validation
    if (validationRules.phone && sanitizedData.phone) {
      sanitizedData.phone = sanitizePhoneNumber(sanitizedData.phone);
      if (!validatePhoneNumber(sanitizedData.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    return {
      isValid: errors.length === 0,
      sanitizedData,
      errors
    };
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const validation = validateAndSanitizeFormData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors([]);
    onSubmit(validation.sanitizedData);
  };

  return (
    <div className="space-y-4">
      {!isSecure && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: This form is not being transmitted over a secure connection (HTTPS). 
            Your data may be at risk.
          </AlertDescription>
        </Alert>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleFormSubmit} noValidate>
        {children}
      </form>
    </div>
  );
};
