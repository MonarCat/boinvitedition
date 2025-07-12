
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { UserBusiness } from '@/types/subscription';

interface SubscriptionHeaderProps {
  userBusiness: UserBusiness | null;
}

export const SubscriptionHeader = ({ userBusiness }: SubscriptionHeaderProps) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Simple, Fair Pricing</h1>
      <p className="text-muted-foreground">Pay only when you earn - 5% commission on successful payments</p>
      
      {userBusiness?.status === 'active' && (
        <div className="mt-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="h-4 w-4 mr-1" />
            Pay As You Earn Active
          </Badge>
        </div>
      )}
    </div>
  );
};
