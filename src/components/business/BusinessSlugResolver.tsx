
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { generateBusinessSlug } from '@/utils/businessSlug';
import { PublicBookingErrorPage } from '@/components/booking/PublicBookingErrorPage';
import { LoadingScreen } from '@/components/ui/loading-screen';
import PublicBookingPage from '@/pages/PublicBookingPage';

const BusinessSlugResolver: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveBusinessSlug = async () => {
      if (!slug) {
        setError('No business slug provided');
        setIsLoading(false);
        return;
      }

      console.log('Slug Debug: Resolving slug:', slug);

      try {
        // Fetch all active businesses and find matching slug
        const { data: businesses, error: businessError } = await supabase
          .from('businesses')
          .select('id, name, is_active')
          .eq('is_active', true);

        if (businessError) {
          console.error('Slug Error: Failed to fetch businesses:', businessError);
          setError('Failed to resolve business');
          setIsLoading(false);
          return;
        }

        // Find business with matching slug
        const matchingBusiness = businesses?.find(business => {
          const businessSlug = generateBusinessSlug(business.name);
          return businessSlug === slug;
        });

        if (matchingBusiness) {
          console.log('Slug Debug: Found matching business:', matchingBusiness.name);
          setBusinessId(matchingBusiness.id);
        } else {
          console.error('Slug Error: No business found for slug:', slug);
          setError('Business not found');
        }
      } catch (error) {
        console.error('Slug Error: Unexpected error:', error);
        setError('Unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    resolveBusinessSlug();
  }, [slug]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !businessId) {
    return (
      <PublicBookingErrorPage
        type="business-not-found"
        error={error || 'Business not found'}
        businessId={slug}
      />
    );
  }

  // Redirect to the proper booking page with the resolved business ID
  return <Navigate to={`/book/${businessId}`} replace />;
};

export default BusinessSlugResolver;
