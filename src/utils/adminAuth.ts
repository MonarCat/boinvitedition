
import { supabase } from '@/integrations/supabase/client';

export const checkAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return profile?.is_admin || false;
  } catch (error) {
    console.error('Error in checkAdmin:', error);
    return false;
  }
};

export const makeUserAdmin = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Use the secure role assignment function
    const { data, error } = await supabase.rpc('secure_assign_admin_role', {
      _target_user_email: email
    });
    
    if (error) {
      console.error('Error assigning admin role:', error);
      return { success: false, message: error.message };
    }
    
    // Parse the result
    const result = data as { success: boolean; message: string };
    return result;
  } catch (error) {
    console.error('Exception in makeUserAdmin:', error);
    return { success: false, message: 'Failed to assign admin role' };
  }
};
