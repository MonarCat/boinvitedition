
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookingPageError } from '@/components/booking/BookingPageError';
import { BookingPageLoading } from '@/components/booking/BookingPageLoading';
import { CleanBookingLayout } from '@/components/booking/CleanBookingLayout';
import { ResponsiveBookingContent } from '@/components/booking/ResponsiveBookingContent';
import { usePublicBookingData } from '@/hooks/usePublicBookingData';
import { isValidUUID, logQRCodeDebugInfo } from '@/utils/uuidValidation';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Enhanced validation and error handling
  React.useEffect(() => {
    if (businessId) {
      logQRCodeDebugInfo(businessId);
    }
  }, [businessId]);

  const { 
    business, 
    businessLoading, 
    businessError, 
    services, 
    servicesLoading 
  } = usePublicBookingData(businessId);

  // Validate UUID format before making database calls
  if (businessId && !isValidUUID(businessId)) {
    return (
      <BookingPageError 
        type="invalid-format" 
        businessId={businessId} 
      />
    );
  }

  if (!businessId) {
    return <BookingPageError type="no-business-id" />;
  }

  if (businessLoading || servicesLoading) {
    return <BookingPageLoading businessId={businessId} />;
  }

  if (businessError || !business) {
    return (
      <BookingPageError 
        type="not-found" 
        businessId={businessId}
        errorMessage={businessError?.message}
      />
    );
  }

  return (
    <CleanBookingLayout className="bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveBookingContent 
          business={business as any}
          services={(services || []) as any[]}
          businessId={businessId}
        />
      </motion.div>
    </CleanBookingLayout>
  );
};

export default PublicBookingPage;
