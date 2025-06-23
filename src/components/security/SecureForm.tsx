
import React, { useState, useEffect } from 'react';
import { sanitizeInput, generateSecureToken } from '@/utils/securityUtils';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: FormData, csrfToken: string) => void;
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({ children, onSubmit, className }) => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate CSRF token on component mount
    setCsrfToken(generateSecureToken());
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Sanitize all form inputs
    const sanitizedData = new FormData();
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        sanitizedData.append(key, sanitizeInput(value));
      } else {
        sanitizedData.append(key, value);
      }
    });

    onSubmit(sanitizedData, csrfToken);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};
