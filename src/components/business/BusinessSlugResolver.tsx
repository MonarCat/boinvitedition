
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { resolveBusinessSlug } from '@/utils/businessSlug';
import { BusinessNotFound } from './location/BusinessNotFound';

const BusinessSlugResolver = () => {
  const { slug } = useParams<{ slug: string }>();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveSlug = async () => {
      if (!slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      // Skip resolution for known system routes that might accidentally get here
      const systemRoutes = ['login', 'auth', 'signup', 'admin', 'api', 'dashboard', 'settings'];
      if (systemRoutes.includes(slug.toLowerCase())) {
        console.log('Slug Debug: Skipping system route:', slug);
        setError('System route');
        setLoading(false);
        return;
      }

      try {
        console.log('Slug Debug: Resolving slug:', slug);
        const resolvedBusinessId = await resolveBusinessSlug(slug);
        console.log('Slug Debug: Resolved business ID:', resolvedBusinessId);
        setBusinessId(resolvedBusinessId);
      } catch (error) {
        console.error('Slug Error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    resolveSlug();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error === 'System route') {
    // Redirect system routes to the auth page or 404
    return <Navigate to="/auth" replace />;
  }

  if (error || !businessId) {
    return <BusinessNotFound slug={slug} />;
  }

  // Navigate to the public booking page with the resolved business ID
  return <Navigate to={`/book/${businessId}`} replace />;
};

export default BusinessSlugResolver;
