
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailInputFieldProps {
  email: string;
  onEmailChange: (email: string) => void;
}

export const EmailInputField: React.FC<EmailInputFieldProps> = ({
  email,
  onEmailChange
}) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          required
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for payment confirmation and receipts
        </p>
      </div>
    </div>
  );
};
