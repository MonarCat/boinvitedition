
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface BillingIntervalSelectorProps {
  defaultValue: string;
  children: React.ReactNode;
}

export const BillingIntervalSelector: React.FC<BillingIntervalSelectorProps> = ({
  defaultValue,
  children
}) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-8">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="quarterly">
          3 Months
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-10%</Badge>
        </TabsTrigger>
        <TabsTrigger value="biannual">
          6 Months  
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-15%</Badge>
        </TabsTrigger>
        <TabsTrigger value="annual">
          1 Year
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-20%</Badge>
        </TabsTrigger>
        <TabsTrigger value="twoYear">
          2 Years
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-25%</Badge>
        </TabsTrigger>
        <TabsTrigger value="threeYear">
          3 Years
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-30%</Badge>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
