
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { checkAdmin, makeUserAdmin } from '@/utils/adminAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRoles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's admin status using the new is_admin flag
  const { data: isAdmin, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-admin-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      return await checkAdmin();
    },
    enabled: !!user,
  });

  // Legacy role checking function for compatibility
  const hasRole = (role: UserRole): boolean => {
    if (role === 'admin') {
      return isAdmin || false;
    }
    return false; // For now, only admin role is supported
  };

  // Assign admin role to a user by email
  const assignAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const result = await makeUserAdmin(email);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Admin role assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-admin-status'] });
    },
    onError: (error: Error) => {
      console.error('Error assigning admin role:', error);
      toast.error(error.message || 'Failed to assign admin role');
    },
  });

  return {
    userRoles: isAdmin ? ['admin'] : [],
    rolesLoading,
    hasRole,
    isAdmin: isAdmin || false,
    isModerator: false, // Not implemented yet
    assignAdmin: assignAdminMutation.mutate,
    assigningAdmin: assignAdminMutation.isPending,
  };
};
