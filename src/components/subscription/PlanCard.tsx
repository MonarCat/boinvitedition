
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Smartphone } from 'lucide-react';
import { UserBusiness } from '@/types/subscription';

// PAYG model - no subscription plans needed
interface PaygCardProps {
  userBusiness: UserBusiness | null;
}

export const PaygCard = ({ userBusiness }: PaygCardProps) => {
  const isActive = userBusiness?.status === 'active';

  return (
    <Card className={`relative bg-primary/5 border-primary/20 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      {isActive && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
          Active
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Pay As You Earn</CardTitle>
        <div className="text-3xl font-bold text-primary">
          5%
          <span className="text-sm font-normal text-muted-foreground"> commission</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Only when you get paid
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Simple, transparent pricing. No monthly fees, no hidden costs.
        </p>
        
        <div className="space-y-2">
          {[
            'Unlimited bookings',
            'All premium features',
            'Payment processing',
            'Customer management',
            'AI-powered tools',
            'WhatsApp integration'
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button disabled className="w-full" variant="outline">
            {isActive ? 'Active Model' : 'Default Pricing'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
