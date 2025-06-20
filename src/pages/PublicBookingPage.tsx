
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isValidUUID } from '@/utils/uuidValidation';
import { usePublicBookingData } from '@/hooks/usePublicBookingData';
import { PublicBookingErrorPage } from '@/components/booking/PublicBookingErrorPage';
import { PublicBookingLoadingPage } from '@/components/booking/PublicBookingLoadingPage';
import { PublicBookingContent } from '@/components/booking/PublicBookingContent';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Enhanced validation and debug logging
  useEffect(() => {
    if (businessId) {
      console.log('QR Code Debug: Business ID from URL:', businessId);
      console.log('QR Code Debug: Current URL:', window.location.href);
      console.log('QR Code Debug: UUID Valid:', isValidUUID(businessId));
      console.log('QR Code Debug: Referrer:', document.referrer || 'Direct access (likely QR scan)');
      
      // Track QR code usage
      const trackQRAccess = async () => {
        try {
          // Optional: Log QR code access for analytics
          console.log('QR Code Access: Business ID accessed via QR/Direct link');
        } catch (error) {
          console.log('QR Code Debug: Analytics tracking failed (non-critical)');
        }
      };
      
      if (!document.referrer) {
        trackQRAccess();
      }
    }
  }, [businessId]);

  // Check for missing business ID
  if (!businessId) {
    return <PublicBookingErrorPage type="no-business-id" />;
  }

  // Validate UUID format before making database calls
  if (!isValidUUID(businessId)) {
    return (
      <PublicBookingErrorPage 
        type="invalid-uuid" 
        businessId={businessId}
      />
    );
  }

  const { business, services, businessLoading, servicesLoading, businessError } = usePublicBookingData(
    businessId, 
    true
  );

  // Loading state
  if (businessLoading || servicesLoading) {
    return (
      <PublicBookingLoadingPage
        businessId={businessId}
        businessLoading={businessLoading}
        servicesLoading={servicesLoading}
      />
    );
  }

  // Error state
  if (businessError || !business) {
    return (
      <PublicBookingErrorPage
        type="business-not-found"
        businessId={businessId}
        error={businessError?.message}
      />
    );
  }

  // Success state
  const isDirectAccess = !document.referrer;

  return (
    <PublicBookingContent
      business={business}
      services={services || []}
      businessId={businessId}
      isDirectAccess={isDirectAccess}
    />
  );
};

export default PublicBookingPage;
