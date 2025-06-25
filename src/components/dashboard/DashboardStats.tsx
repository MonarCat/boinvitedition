
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardKPISection } from './DashboardKPISection';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardStatsProps {
  business: any;
  onEditBusiness: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  business,
  onEditBusiness
}) => {
  const {
    stats,
    currency,
    formatPrice,
    handleKpiRefresh,
    timePeriod,
    setTimePeriod,
  } = useDashboardData(business?.id);

  return (
    <DashboardKPISection 
      business={business}
      stats={stats}
      currency={currency}
      formatPrice={formatPrice}
      onRefresh={handleKpiRefresh}
      onEditBusiness={onEditBusiness}
      timePeriod={timePeriod}
      onTimePeriodChange={setTimePeriod}
    />
  );
};
