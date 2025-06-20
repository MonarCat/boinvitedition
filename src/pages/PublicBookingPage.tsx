
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isValidUUID } from '@/utils/uuidValidation';
import { usePublicBookingData } from '@/hooks/usePublicBookingData';
import { PublicBookingErrorPage } from '@/components/booking/PublicBookingErrorPage';
import { PublicBookingLoadingPage } from '@/components/booking/PublicBookingLoadingPage';
import { PublicBookingContent } from '@/components/booking/PublicBookingContent';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Enhanced validation and debug logging
  useEffect(() => {
    if (businessId) {
      console.log('QR Code Debug: Business ID from URL:', businessId);
      console.log('QR Code Debug: Current URL:', window.location.href);
      console.log('QR Code Debug: UUID Valid:', isValidUUID(businessId));
      console.log('QR Code Debug: Referrer:', document.referrer || 'Direct access (likely QR scan)');
      console.log('QR Code Debug: User Agent:', navigator.userAgent);
      
      // Track QR code usage with enhanced debugging
      const trackQRAccess = async () => {
        try {
          console.log('QR Code Access: Business ID accessed via QR/Direct link');
          console.log('QR Code Debug: Starting business lookup...');
        } catch (error) {
          console.log('QR Code Debug: Analytics tracking failed (non-critical)');
        }
      };
      
      if (!document.referrer) {
        trackQRAccess();
      }
    } else {
      console.error('QR Code Error: No business ID found in URL parameters');
    }
  }, [businessId]);

  // Check for missing business ID
  if (!businessId) {
    console.error('QR Code Error: Business ID parameter is missing from URL');
    return <PublicBookingErrorPage type="no-business-id" />;
  }

  // Validate UUID format before making database calls
  if (!isValidUUID(businessId)) {
    console.error('QR Code Error: Invalid UUID format:', businessId);
    return (
      <PublicBookingErrorPage 
        type="invalid-uuid" 
        businessId={businessId}
      />
    );
  }

  const { business, services, businessLoading, servicesLoading, businessError, refetchBusiness } = usePublicBookingData(
    businessId, 
    true
  );

  // Loading state with branded loading screen
  if (businessLoading || servicesLoading) {
    return <LoadingScreen />;
  }

  // Error state with retry option
  if (businessError || !business) {
    console.error('QR Code Error: Final error state reached:', {
      businessError: businessError?.message,
      businessExists: !!business,
      businessId
    });
    
    return (
      <PublicBookingErrorPage
        type="business-not-found"
        businessId={businessId}
        error={businessError?.message}
        onRetry={() => refetchBusiness()}
      />
    );
  }

  // Success state
  const isDirectAccess = !document.referrer;
  console.log('QR Code Debug: Rendering successful booking page for:', business.name);

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
