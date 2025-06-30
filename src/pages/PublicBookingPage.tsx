
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingPageError } from '@/components/booking/BookingPageError';
import { BookingPageLoading } from '@/components/booking/BookingPageLoading';
import { CleanBookingLayout } from '@/components/booking/CleanBookingLayout';
import { ResponsiveBookingContent } from '@/components/booking/ResponsiveBookingContent';
import { MobileBottomNavigation, BookingStep } from '@/components/booking/MobileBottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePublicBookingData } from '@/hooks/usePublicBookingData';
import { isValidUUID, logQRCodeDebugInfo } from '@/utils/uuidValidation';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<BookingStep>('serviceSelection');
  const [disabledSteps, setDisabledSteps] = useState<BookingStep[]>([
    'clientDetails', 'calendar', 'staffSelection', 'payment', 'confirmation'
  ]);

  // Enhanced validation and error handling
  useEffect(() => {
    if (businessId) {
      logQRCodeDebugInfo(businessId);
    }
    
    // Add app-like meta viewport for mobile devices
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      // For best mobile experience: no scaling, cover notches, and smoother animations
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no'
      );
    }
    
    // Add a class to body for mobile-specific styles
    if (isMobile) {
      document.body.classList.add('mobile-booking-flow');
      // Prevent overscroll/bounce effect on iOS
      document.body.style.overscrollBehavior = 'none';
    }
    
    // Cleanup when unmounting
    return () => {
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
      document.body.classList.remove('mobile-booking-flow');
      document.body.style.overscrollBehavior = '';
    };
  }, [businessId, isMobile]);

  const { 
    business, 
    businessLoading, 
    businessError, 
    services, 
    servicesLoading 
  } = usePublicBookingData(businessId);

  // Handle step changes from responsive booking content
  const handleStepChange = (step: BookingStep) => {
    setCurrentStep(step);
  };

  // Update disabled steps based on booking flow
  const handleDisabledStepsUpdate = (newDisabledSteps: BookingStep[]) => {
    setDisabledSteps(newDisabledSteps);
  };

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
    <CleanBookingLayout 
      className="bg-gradient-to-b from-gray-50 to-white"
      businessName={business.name}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="booking-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={isMobile ? "pb-20" : ""}
        >
          <ResponsiveBookingContent 
            business={business as any}
            services={(services || []) as any[]}
            businessId={businessId}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onDisabledStepsChange={handleDisabledStepsUpdate}
            isMobileView={isMobile}
          />
        </motion.div>
      </AnimatePresence>
      
      {isMobile && (
        <MobileBottomNavigation 
          currentStep={currentStep}
          onChangeStep={handleStepChange}
          disabledSteps={disabledSteps}
        />
      )}
    </CleanBookingLayout>
  );
};

export default PublicBookingPage;
