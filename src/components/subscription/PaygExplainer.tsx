import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  DollarSign, 
  Check, 
  CreditCard, 
  Clock, 
  HelpCircle,
  CalendarDays
} from 'lucide-react';
import { formatCommissionRate } from '@/utils';

export const PaygExplainer: React.FC = () => {
  const commissionRate = 0.05; // 5% commission rate
  
  return (
    <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-100">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-orange-500" />
          <CardTitle>Understanding Pay As You Go</CardTitle>
        </div>
        <CardDescription>
          Everything you need to know about our simple pricing model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              How It Works
            </h3>
            <p className="text-gray-600">
              You only pay when you get paid. Boinvit retains {formatCommissionRate(commissionRate)} on all transactions 
              and the remaining 95% is disbursed to your business.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-500" />
              Benefits
            </h3>
            <ul className="text-gray-600 space-y-1">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>No monthly fees or commitments</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Perfect for businesses of all sizes</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Scale up or down without changing plans</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-gray-700">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-orange-500" />
                Frequently Asked Questions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="font-medium">When am I charged?</h4>
                  <p className="text-gray-600">
                    Only when your customers make a successful payment through our platform.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Are there any hidden fees?</h4>
                  <p className="text-gray-600">
                    No. Boinvit simply retains {formatCommissionRate(commissionRate)} on transactions and disburses 95% to your business. 
                    No setup fees, no monthly subscriptions, no cancellation fees.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">How do I cancel?</h4>
                  <p className="text-gray-600">
                    There's nothing to cancel! Since you only pay when you receive payments,
                    you can stop using the platform anytime without any penalty.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
