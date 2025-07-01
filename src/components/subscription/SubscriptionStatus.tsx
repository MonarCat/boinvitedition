
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, Crown, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface SubscriptionStatusProps {
  subscription: any;
  onUpgrade: () => void;
  businessId: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  onUpgrade,
  businessId
}) => {
  // If no subscription exists, default to Pay As You Go
  if (!subscription) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-green-600" />
            Pay As You Go
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You are on our default Pay As You Go model - no monthly fees, just a 5% commission on payments.
          </p>
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-green-800">✓ Active with full platform access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPAYG = subscription.plan_type === 'payg';
  const isTrialPlan = subscription.plan_type === 'trial';
  const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const daysRemaining = trialEndsAt ? differenceInDays(trialEndsAt, new Date()) : 0;
  const isExpiring = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0 && isTrialPlan;

  const getPlanDisplayName = (planType: string) => {
    switch (planType) {
      case 'trial': return 'Free Trial';
      case 'starter': return 'Starter Plan';
      case 'medium': return 'Business Plan';
      case 'premium': return 'Enterprise Plan';
      case 'payg': return 'Pay As You Go';
      default: return planType;
    }
  };

  const getStatusColor = () => {
    if (isExpired) return 'bg-red-100 text-red-800';
    if (isExpiring) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  // Special display for Pay As You Go (PAYG) plan
  if (isPAYG) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-green-600" />
              Pay As You Go
            </div>
            <Badge className="bg-green-100 text-green-800">
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>Unlimited staff members</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Unlimited bookings</span>
          </div>
          
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-green-800">5% commission on payments only, no monthly fees</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For any other plan types (which should be rare/none as PAYG is default)
  return (
    <Card className={`${isExpiring ? 'border-orange-200 bg-orange-50' : isExpired ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            {getPlanDisplayName(subscription.plan_type)}
          </div>
          <Badge className={getStatusColor()}>
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrialPlan && trialEndsAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {isExpired ? 'Trial expired on' : 'Trial ends on'} {format(trialEndsAt, 'PPP')}
              {!isExpired && ` (${daysRemaining} days remaining)`}
            </span>
          </div>
        )}

        {subscription.staff_limit && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>Staff limit: {subscription.staff_limit}</span>
          </div>
        )}

        {subscription.bookings_limit && (
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Monthly bookings limit: {subscription.bookings_limit.toLocaleString()}</span>
          </div>
        )}

        {/* For any non-PAYG plan, always show option to switch to Pay As You Go */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onUpgrade} 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Switch to Pay As You Go
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
