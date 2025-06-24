
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ClientDetails {
  email: string;
  phone: string;
  name: string;
}

interface ClientDetailsFormProps {
  clientDetails: ClientDetails;
  setClientDetails: React.Dispatch<React.SetStateAction<ClientDetails>>;
  showClientDetails: boolean;
}

export const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({
  clientDetails,
  setClientDetails,
  showClientDetails
}) => {
  if (!showClientDetails) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client_email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <Input
          id="client_email"
          type="email"
          placeholder="your@email.com"
          value={clientDetails.email}
          onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
          className="border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_phone" className="text-sm font-medium text-gray-700">
          Phone Number
        </Label>
        <Input
          id="client_phone"
          type="tel"
          placeholder="254712345678"
          value={clientDetails.phone}
          onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
          className="border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_name" className="text-sm font-medium text-gray-700">
          Full Name (Optional)
        </Label>
        <Input
          id="client_name"
          type="text"
          placeholder="Your full name"
          value={clientDetails.name}
          onChange={(e) => setClientDetails(prev => ({ ...prev, name: e.target.value }))}
          className="border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  );
};
