
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
    const { error } = await supabase.rpc('assign_admin_role', {
      _user_email: email
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Admin role assigned successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to assign admin role' };
  }
};
