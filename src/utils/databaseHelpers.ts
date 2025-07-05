import { supabase } from '@/integrations/supabase/client';

/**
 * Safely adds avatar URL to staff data if the column exists
 * @param staffData The staff data object
 * @param avatarUrl The URL of the avatar image
 */
export function safelyAddStaffAvatar(
  staffData: Record<string, unknown>,
  avatarUrl: string | null
): Record<string, unknown> {
  // Create a new object with the existing data
  const result = { ...staffData };
  
  // If we have an avatar URL, try to add it to the object
  if (avatarUrl !== null) {
    // We intentionally omit the avatar_url if it's null
    result.avatar_url = avatarUrl;
  }
  
  return result;
}
