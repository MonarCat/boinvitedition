
import React from 'react';
import { UserBusiness } from '@/types/subscription';
import { PaygCard } from './PlanCard';

interface PaygGridProps {
  userBusiness: UserBusiness | null;
}

export const PaygGrid = ({ userBusiness }: PaygGridProps) => {
  return (
    <div className="flex justify-center">
      <div className="max-w-md">
        <PaygCard userBusiness={userBusiness} />
      </div>
    </div>
  );
};
