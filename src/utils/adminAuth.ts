
import { supabase } from '@/integrations/supabase/client';

export const checkAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Log unauthorized admin check attempt
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'UNAUTHORIZED_ADMIN_CHECK',
        p_description: 'Admin check attempted without authentication',
        p_metadata: { timestamp: new Date().toISOString() },
        p_severity: 'medium'
      });
      return false;
    }
    
    // Use the secure user roles table instead of profiles.is_admin
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      // Log admin check error
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'ADMIN_CHECK_ERROR',
        p_description: 'Error during admin status verification',
        p_metadata: { 
          user_id: user.id,
          error: error.message 
        },
        p_severity: 'medium'
      });
      return false;
    }
    
    const isAdmin = roles && roles.length > 0;
    
    // Log admin access for security monitoring
    if (isAdmin) {
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'ADMIN_ACCESS',
        p_description: 'Admin access granted',
        p_metadata: { 
          user_id: user.id,
          email: user.email 
        },
        p_severity: 'low'
      });
    }
    
    return isAdmin;
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
