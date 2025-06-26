import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, User, Mail, Phone, Loader2 } from 'lucide-react';

interface ClientInformationCardProps {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  isProcessing?: boolean;
}

export const ClientInformationCard: React.FC<ClientInformationCardProps> = ({
  clientName,
  clientEmail,
  clientPhone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onSubmit,
  isValid,
  isProcessing
}) => {
  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Information</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">Please provide your details to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex items-center">
          <User className="absolute left-3 h-5 w-5 text-slate-400" />
          <Input 
            id="name" 
            placeholder="Enter your full name"
            value={clientName}
            onChange={(e) => onNameChange(e.target.value)}
            className="pl-10 h-12 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 w-full"
          />
        </div>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-5 w-5 text-slate-400" />
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com"
            value={clientEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10 h-12 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 w-full"
          />
        </div>
        <div className="relative flex items-center">
          <Phone className="absolute left-3 h-5 w-5 text-slate-400" />
          <Input 
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={clientPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="pl-10 h-12 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 w-full"
          />
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-base transition-all duration-300 ease-in-out flex items-center justify-center transform hover:scale-105 disabled:scale-100 disabled:bg-slate-400 dark:disabled:bg-slate-600"
          disabled={!isValid || isProcessing}
          onClick={onSubmit}
        >
          {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          <span>{isProcessing ? 'Processing...' : 'Continue to Payment'}</span>
          {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          You will be prompted for payment after this step.
        </p>
      </CardContent>
    </Card>
  );
};
