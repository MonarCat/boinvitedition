
import { supabase } from '@/integrations/supabase/client';

export const generateBusinessSlug = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
};

export const resolveBusinessSlug = async (slug: string): Promise<string> => {
  if (!slug || !isValidSlug(slug)) {
    throw new Error('Invalid slug format');
  }

  // First try to find by exact slug match if we had a slug field
  // For now, we'll search by generated slug from business name
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('is_active', true);

  if (error) {
    throw new Error('Failed to search businesses');
  }

  // Find business whose generated slug matches the provided slug
  for (const business of businesses || []) {
    const generatedSlug = generateBusinessSlug(business.name);
    if (generatedSlug === slug) {
      return business.id;
    }
  }

  throw new Error('Business not found');
};
