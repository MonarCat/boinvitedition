
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone } from 'lucide-react';

interface ClientDetailsFormProps {
  clientDetails: {
    email: string;
    phone: string;
    name: string;
  };
  setClientDetails: React.Dispatch<React.SetStateAction<{
    email: string;
    phone: string;
    name: string;
  }>>;
  showClientDetails: boolean;
}

export const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({
  clientDetails,
  setClientDetails,
  showClientDetails
}) => {
  if (!showClientDetails) return null;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Your Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-name" className="text-xs font-medium text-gray-600">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="client-name"
              type="text"
              placeholder="Enter your full name"
              value={clientDetails.name}
              onChange={(e) => setClientDetails(prev => ({ ...prev, name: e.target.value }))}
              className="pl-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-email" className="text-xs font-medium text-gray-600">
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="client-email"
              type="email"
              placeholder="your.email@example.com"
              value={clientDetails.email}
              onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
              className="pl-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-phone" className="text-xs font-medium text-gray-600">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="client-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={clientDetails.phone}
              onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="pl-10 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
