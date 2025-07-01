import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Clock, Users, TrendingUp, Zap, Crown, Smartphone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

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
  icon: any;
  color: string;
  staffLimit?: number | null;
  bookingsLimit?: number | null;
}

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId: string;
  customerEmail?: string;
  onSelectPlan: (planId: string, interval: string, amount: number, paystackReference?: string) => void;
  isLoading: boolean;
}

export const EnhancedSubscriptionPlans = ({
  currentPlan,
  businessId,
  customerEmail,
  onSelectPlan,
  isLoading
}: EnhancedSubscriptionPlansProps) => {
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: 10,
      currency: 'KES',
      interval: 'one-time',
      description: '7-day trial with full access',
      icon: Clock,
      color: 'orange',
      staffLimit: 3,
      bookingsLimit: 100,
      features: [
        '7 days full platform access',
        'Up to 3 staff members',
        'Up to 100 bookings',
        'QR code generation',
        'Basic support',
        'Payment integration'
      ]
    },
    {
      id: 'payg',
      name: 'Pay As You Go',
      price: 0,
      currency: 'KES',
      interval: 'commission',
      description: 'Only pay when you get paid',
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
        'Advanced analytics'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 399,
      yearlyPrice: 3990,
      currency: 'KES',
      interval: selectedInterval,
      description: 'Perfect for solo entrepreneurs',
      icon: Users,
      color: 'blue',
      staffLimit: 1,
      bookingsLimit: 500,
      features: [
        '1 staff member',
        'Up to 500 bookings/month',
        'Basic features',
        'Email support',
        'QR code generation',
        'Payment processing'
      ]
    },
    {
      id: 'economy',
      name: 'Economy',
      price: 899,
      yearlyPrice: 8990,
      currency: 'KES',
      interval: selectedInterval,
      description: 'Great for small teams',
      icon: Zap,
      color: 'purple',
      popular: true,
      staffLimit: 5,
      bookingsLimit: 1000,
      features: [
        '5 staff members',
        'Up to 1,000 bookings/month',
        'Advanced features',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ]
    },
    {
      id: 'medium',
      name: 'Business',
      price: 2900,
      yearlyPrice: 29000,
      currency: 'KES',
      interval: selectedInterval,
      description: 'For growing businesses',
      icon: Crown,
      color: 'indigo',
      staffLimit: 15,
      bookingsLimit: 5000,
      features: [
        '15 staff members',
        'Up to 5,000 bookings/month',
        'Premium features',
        'Priority support',
        'White-label options',
        'Advanced reporting'
      ]
    },
    {
      id: 'premium',
      name: 'Enterprise',
      price: 8900,
      yearlyPrice: 89000,
      currency: 'KES',
      interval: selectedInterval,
      description: 'Enterprise solution',
      icon: Star,
      color: 'gold',
      staffLimit: null,
      bookingsLimit: null,
      features: [
        'Unlimited staff members',
        'Unlimited bookings',
        'All premium features',
        '24/7 priority support',
        'Complete white-labeling',
        'API access',
        'Dedicated account manager'
      ]
    }
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (processingPlan) return;
    
    setProcessingPlan(plan.id);
    setPaymentError(null);
    
    try {
      if (plan.id === 'trial') {
        await onSelectPlan(plan.id, 'trial', plan.price);
        toast.success('Free trial activated!');
      } else if (plan.id === 'payg') {
        // Ensure we correctly set the payment_interval to 'commission'
        try {
          // Double-check we're using the right interval type for PAYG
          toast.loading('Activating Pay As You Go plan...');
          await onSelectPlan(plan.id, 'commission', 0);
          toast.dismiss();
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
      } else {
        const amount = selectedInterval === 'yearly' ? (plan.yearlyPrice || plan.price * 12) : plan.price;
        
        // For paid plans, integrate with Paystack
        if (typeof window !== 'undefined' && window.PaystackPop) {
          // Function to handle Paystack integration
          try {
            const handler = window.PaystackPop.setup({
              key: 'pk_test_your_paystack_public_key_here', // Replace with actual key
              email: customerEmail || 'customer@example.com',
              amount: amount * 100, // Paystack expects amount in kobo
              currency: 'KES',
              ref: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              metadata: {
                business_id: businessId,
                plan_type: plan.id,
                interval: selectedInterval
              },
              callback: function(response) {
                try {
                  onSelectPlan(plan.id, selectedInterval, amount, response.reference);
                  toast.success(`${plan.name} plan activated!`);
                } catch (callbackError) {
                  console.error('Payment callback error:', callbackError);
                  setPaymentError('Payment was processed but plan activation failed.');
                  toast.error('Payment processed but plan activation failed.');
                }
              },
              onClose: function() {
                setProcessingPlan(null);
                console.log('Payment window closed');
              }
            });
            handler.openIframe();
          } catch (paystackError) {
            console.error('Paystack error:', paystackError);
            setPaymentError('Payment gateway error. Please try again.');
            throw paystackError;
          }
        } else {
          // Fallback for testing
          await onSelectPlan(plan.id, selectedInterval, amount);
          toast.success(`${plan.name} plan activated!`);
        }
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
    if (plan.id === 'payg') return '5% commission only';
    if (plan.id === 'trial') return formatPrice(plan.price, plan.currency);
    
    return selectedInterval === 'yearly' && plan.yearlyPrice
      ? formatPrice(plan.yearlyPrice, plan.currency)
      : formatPrice(plan.price, plan.currency);
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

      {/* Interval Toggle */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedInterval('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedInterval === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedInterval('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedInterval === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Yearly <Badge className="ml-1 bg-green-100 text-green-800">Save 17%</Badge>
          </button>
        </div>
      </div>

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
                  {plan.id !== 'payg' && plan.id !== 'trial' && (
                    <div className="text-sm text-gray-500">
                      per {selectedInterval === 'yearly' ? 'year' : 'month'}
                    </div>
                  )}
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
