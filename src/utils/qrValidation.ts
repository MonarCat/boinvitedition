
import { supabase } from '@/integrations/supabase/client';

export interface BusinessValidationResult {
  isValid: boolean;
  business?: {
    id: string;
    name: string;
    is_active: boolean;
  };
  error?: string;
}

export async function validateBusiness(businessId: string): Promise<BusinessValidationResult> {
  if (!businessId) {
    return {
      isValid: false,
      error: 'No business ID provided'
    };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(businessId)) {
    return {
      isValid: false,
      error: 'Invalid business ID format'
    };
  }

  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, name, is_active')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('Business validation error:', error);
      return {
        isValid: false,
        error: 'Database error during validation'
      };
    }

    if (!business) {
      return {
        isValid: false,
        error: 'Business not found'
      };
    }

    if (!business.is_active) {
      return {
        isValid: false,
        error: 'Business is inactive'
      };
    }

    return {
      isValid: true,
      business
    };
  } catch (error) {
    console.error('Unexpected error during business validation:', error);
    return {
      isValid: false,
      error: 'Unexpected validation error'
    };
  }
}

export function generateBookingUrl(businessId: string, baseUrl?: string): string {
  const origin = baseUrl || window.location.origin;
  return `${origin}/book/${businessId}`;
}
