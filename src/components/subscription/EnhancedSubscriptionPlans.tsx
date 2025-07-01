import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, TrendingUp, Smartphone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

// No Paystack integration needed for commission-only model

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  icon: React.ElementType;
  color: string;
  staffLimit?: number | null;
  bookingsLimit?: number | null;
}

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId: string;
  onSelectPlan: (planId: string, interval: string, amount: number) => void;
  isLoading: boolean;
}

export const EnhancedSubscriptionPlans = ({
  currentPlan,
  businessId,
  onSelectPlan,
  isLoading
}: EnhancedSubscriptionPlansProps) => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // No need for Paystack script for commission-only model

  const plans: Plan[] = [
    {
      id: 'payg',
      name: 'Pay As You Go',
      price: 0,
      currency: 'KES',
      interval: 'commission',
      description: 'Only pay when you get paid - 5% commission',
      icon: TrendingUp,
      color: 'red',
      recommended: true,
      popular: true,
      staffLimit: null,
      bookingsLimit: null,
      features: [
        'No monthly subscription',
        'Only 5% commission on payments received',
        'Unlimited staff members',
        'Unlimited bookings',
        'Full platform access',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'White-label options',
        'API access',
        '24/7 priority support'
      ]
    }
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (processingPlan) return;
    
    setProcessingPlan(plan.id);
    setPaymentError(null);
    
    try {
      // Since we only have PAYG plan, ensure we correctly set the payment_interval to 'commission'
      try {
        const toastId = toast.loading('Activating Pay As You Go plan...');
        await onSelectPlan(plan.id, 'commission', 0);
        toast.dismiss(toastId);
        toast.success('Pay As You Go plan activated successfully!', {
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
      } catch (payAsYouGoError) {
        console.error('PAYG error:', payAsYouGoError);
        toast.dismiss();
        
        // Check if the error is related to our database constraint
        const errorMessage = payAsYouGoError instanceof Error 
          ? payAsYouGoError.message 
          : String(payAsYouGoError);
          
        // Fallback for constraint errors
        if (errorMessage.includes('violates check constraint') && 
            errorMessage.includes('payment_interval')) {
          // Try alternative approach - some systems may use different enum values
          try {
            await onSelectPlan(plan.id, 'monthly', 0); // Fallback to monthly with 0 cost
            toast.success('Pay As You Go plan activated with alternative settings!');
            return;
          } catch (fallbackError) {
            setPaymentError('Database constraint error: Please make sure the migration for "commission" payment type has been applied.');
            toast.error('Plan activation failed: Database needs updating.');
          }
        } else {
          setPaymentError(errorMessage);
          toast.error('Failed to activate Pay As You Go plan.');
        }
        
        throw payAsYouGoError;
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      if (!paymentError) {
        setPaymentError('Failed to activate plan. Please try again.');
      }
      toast.error(paymentError || 'Failed to activate plan. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency === 'KES' ? 'KSh' : currency} ${price.toLocaleString()}`;
  };

  const getEffectivePrice = (plan: Plan) => {
    return '5% commission only';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Payment Error Message */}
      {paymentError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Subscription Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{paymentError}</p>
                {paymentError.includes('migration') && (
                  <p className="mt-2 font-medium">Admin action required: Run the database migration to add 'commission' as a valid payment_interval value.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No interval toggle needed for commission-only model */}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isProcessing = processingPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.id === 'payg' 
                  ? 'border-2 border-red-500 shadow-xl transform hover:scale-105' 
                  : plan.popular ? 'border-2 border-blue-500' : ''
              } ${plan.id !== 'payg' && plan.recommended ? 'border-2 border-green-500' : ''} ${
                isCurrentPlan ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && plan.id !== 'payg' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.recommended && plan.id !== 'payg' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              
              {plan.id === 'payg' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-red-600 text-white px-4 py-1 font-bold shadow-md">
                    <Star className="w-3 h-3 mr-1" />
                    NO MONTHLY FEE
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${plan.color}-100 flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 text-${plan.color}-600`} />
                </div>
                
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="mt-4">
                  <div className={`text-3xl font-bold ${plan.id === 'payg' ? 'text-red-600' : 'text-gray-900'}`}>
                    {getEffectivePrice(plan)}
                  </div>
                  {plan.id === 'payg' && (
                    <div className="text-sm text-red-600 font-semibold mt-1">
                      No monthly subscription
                    </div>
                  )}
                  {/* No subscription period needed for commission-only model */}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan || isProcessing || isLoading}
                  className={`w-full ${
                    plan.id === 'payg'
                      ? 'bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg'
                      : plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : plan.recommended
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : isProcessing 
                    ? 'Processing...' 
                    : plan.id === 'payg'
                    ? 'Pay As You Go' 
                    : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods Info */}
      <div className="text-center bg-gray-50 rounded-lg p-6">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Smartphone className="w-6 h-6 text-green-600" />
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Secure Payment Options:</strong> M-Pesa, Airtel Money, Credit/Debit Cards, Bank Transfer
        </p>
        <p className="text-xs text-gray-500">
          All payments are processed securely through Paystack with bank-level encryption
        </p>
      </div>
    </div>
  );
};
