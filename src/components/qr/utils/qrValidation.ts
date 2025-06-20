
import { supabase } from '@/integrations/supabase/client';

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateBusiness = async (businessId: string) => {
  if (!isValidUUID(businessId)) {
    throw new Error('Invalid business ID format');
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('id', businessId)
    .eq('is_active', true)
    .single();

  if (error || !business) {
    throw new Error('Business not found or inactive');
  }

  return business;
};
