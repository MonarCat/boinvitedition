import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setIsOnboardingComplete(true); // Default to true to avoid blocking
          return;
        }

        if (data) {
          setBusinessId(data.id);
          setIsOnboardingComplete(data.onboarding_completed ?? false);
        } else {
          // No business yet - they need to create one first
          setIsOnboardingComplete(null);
        }
      } catch (error) {
        console.error('Onboarding status check failed:', error);
        setIsOnboardingComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  return { 
    isOnboardingComplete, 
    isLoading, 
    businessId,
    needsOnboarding: isOnboardingComplete === false && businessId !== null
  };
};
