
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { sanitizeInput, validateEmail, validatePhoneNumber } from '@/utils/securityUtils';

interface FormData {
  [key: string]: string;
}

interface SecurityFormProps {
  onSubmit: (data: FormData) => void;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea';
    required?: boolean;
    maxLength?: number;
  }>;
  title: string;
  isLoading?: boolean;
}

export const EnhancedSecurityForm: React.FC<SecurityFormProps> = ({
  onSubmit,
  fields,
  title,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

  const validateField = (name: string, value: string, type: string): string => {
    if (!value && fields.find(f => f.name === name)?.required) {
      return 'This field is required';
    }

    switch (type) {
      case 'email':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !validatePhoneNumber(value)) {
          return 'Please enter a valid phone number';
        }
        break;
      default:
        if (value && value.length > (fields.find(f => f.name === name)?.maxLength || 500)) {
          return `Maximum ${fields.find(f => f.name === name)?.maxLength || 500} characters allowed`;
        }
    }
    
    return '';
  };

  const handleInputChange = (name: string, value: string, type: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    
    // Check for potential security issues
    const warnings: string[] = [];
    if (value !== sanitizedValue) {
      warnings.push('Potentially unsafe characters were removed from your input');
    }
    
    if (value.match(/<script|javascript:|data:|vbscript:/i)) {
      warnings.push('Potentially malicious content detected and blocked');
    }
    
    setSecurityWarnings(warnings);
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate field
    const error = validateField(name, sanitizedValue, type);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name] || '', field.type);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    // Additional security check before submission
    const sanitizedData: FormData = {};
    Object.entries(formData).forEach(([key, value]) => {
      sanitizedData[key] = sanitizeInput(value);
    });
    
    onSubmit(sanitizedData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {securityWarnings.length > 0 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <ul className="list-disc list-inside">
                {securityWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                  className={errors[field.name] ? 'border-red-500' : ''}
                  maxLength={field.maxLength || 500}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                  className={errors[field.name] ? 'border-red-500' : ''}
                  maxLength={field.maxLength || 250}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-sm text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
