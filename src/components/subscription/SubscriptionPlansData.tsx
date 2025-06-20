
import React from 'react';
import { Clock, Percent, Zap, Star, Crown } from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: number;
    quarterly: number;
    biannual: number;
    annual: number;
    twoYear: number;
    threeYear: number;
  };
  discounts: {
    quarterly: number;
    biannual: number;
    annual: number;
    twoYear: number;
    threeYear: number;
  };
  limits: {
    staff: number | null;
    bookings: number | null;
  };
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    description: '7 days of full premium access with one-time setup fee',
    features: [
      '7 days complete premium access',
      'All Business Plan features included',
      'QR code booking system',
      'WhatsApp notifications',
      'Client management',
      'Perfect for testing',
      'Auto-upgrade to Business Plan after 7 days'
    ],
    pricing: {
      monthly: 10,
      quarterly: 10,
      biannual: 10,
      annual: 10,
      twoYear: 10,
      threeYear: 10
    },
    discounts: {
      quarterly: 0,
      biannual: 0,
      annual: 0,
      twoYear: 0,
      threeYear: 0
    },
    limits: { staff: null, bookings: null },
    icon: <Clock className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'payasyougo',
    name: 'Pay As You Go',
    description: 'Perfect for businesses with occasional bookings',
    features: [
      'No monthly subscription fees',
      '7% commission per booking',
      'Clients must prepay for bookings',
      'Automatic 93% payment to you',
      'Real-time settlements',
      'QR code booking system',
      'WhatsApp notifications',
      'Payment option disabled for businesses'
    ],
    pricing: {
      monthly: 10,
      quarterly: 10,
      biannual: 10,
      annual: 10,
      twoYear: 10,
      threeYear: 10
    },
    discounts: {
      quarterly: 0,
      biannual: 0,
      annual: 0,
      twoYear: 0,
      threeYear: 0
    },
    limits: { staff: null, bookings: null },
    icon: <Percent className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 5 staff members',
      '1,000 bookings per month',
      'QR code booking system',
      'WhatsApp notifications',
      'Basic analytics dashboard',
      'Email support',
      'No commission fees',
      'Client payment options'
    ],
    pricing: {
      monthly: 1020,
      quarterly: 2754,
      biannual: 5202,
      annual: 9792,
      twoYear: 18360,
      threeYear: 26010
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 5, bookings: 1000 },
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'medium',
    name: 'Business Plan',
    description: 'Perfect for growing businesses - Auto-upgrade after trial',
    features: [
      'Up to 15 staff members',
      '3,000 bookings per month',
      'QR code booking system',
      'WhatsApp notifications',
      'Advanced analytics & reports',
      'Priority email support',
      'Custom branding options',
      'No commission fees',
      'Client payment options',
      'Auto-upgrade from trial'
    ],
    pricing: {
      monthly: 2900,
      quarterly: 7830,
      biannual: 14790,
      annual: 27840,
      twoYear: 52200,
      threeYear: 73980
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 15, bookings: 3000 },
    icon: <Star className="w-6 h-6" />,
    popular: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'premium',
    name: 'Enterprise Plan',
    description: 'Unlimited features for large organizations',
    features: [
      'Unlimited staff members',
      'Unlimited bookings',
      'QR code booking system',
      'WhatsApp notifications',
      'Advanced analytics & reports',
      '24/7 priority support',
      'Custom integrations',
      'API access',
      'White-label options',
      'No commission fees',
      'Client payment options'
    ],
    pricing: {
      monthly: 9900,
      quarterly: 26730,
      biannual: 50490,
      annual: 95040,
      twoYear: 178200,
      threeYear: 252450
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: null, bookings: null },
    icon: <Crown className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500'
  }
];
