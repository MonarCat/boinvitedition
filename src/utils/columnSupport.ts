import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column
 * @returns A promise that resolves to a boolean indicating whether the column exists
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    // Query the information_schema to check if the column exists
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`Error checking if ${columnName} exists in ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Exception checking if ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

/**
 * Utility to safely use the avatar_url field
 * @param tableName The name of the table
 * @returns An object with functions for safely handling avatar URLs
 */
export function useAvatarSupport(tableName: string = 'staff') {
  let avatarSupported: boolean | null = null;
  
  /**
   * Checks if avatar_url is supported
   */
  const checkAvatarSupport = async (): Promise<boolean> => {
    if (avatarSupported !== null) return avatarSupported;
    
    avatarSupported = await checkColumnExists(tableName, 'avatar_url');
    return avatarSupported;
  };
  
  /**
   * Safely adds avatar_url to an object if supported
   */
  const safelyAddAvatarUrl = async (obj: Record<string, any>, avatarUrl?: string): Promise<Record<string, any>> => {
    if (!avatarUrl) return obj;
    
    const isSupported = await checkAvatarSupport();
    if (isSupported) {
      return { ...obj, avatar_url: avatarUrl };
    }
    
    return obj;
  };
  
  return {
    checkAvatarSupport,
    safelyAddAvatarUrl
  };
}
