
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
    // First, try to find the user in profiles by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (profileError || !profile) {
      return { success: false, message: 'User not found. Please make sure the user has signed up first.' };
    }
    
    // Update the user's admin status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', profile.id);
    
    if (updateError) {
      return { success: false, message: updateError.message };
    }
    
    return { success: true, message: 'Admin role assigned successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to assign admin role' };
  }
};
