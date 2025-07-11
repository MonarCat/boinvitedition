import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Eye, 
  Settings, 
  Mail, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  UserX,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  id: string;
  action: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  table_name: string;
}

export const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [recoveryReason, setRecoveryReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch all user profiles with search
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        const searchPattern = `%${searchTerm.toLowerCase()}%`;
        query = query.or(`email.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch user activity for selected user
  const { data: userActivity } = useQuery({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];

      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserActivity[];
    },
    enabled: !!selectedUser
  });

  // Reset user email mutation
  const resetEmailMutation = useMutation({
    mutationFn: async ({ userId, newEmail }: { userId: string; newEmail: string }) => {
      // First validate the new email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error('Invalid email format');
      }

      // Update profile email
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Log the action
      const { error: logError } = await supabase
        .from('audit_log')
        .insert({
          action: 'EMAIL_RESET_BY_ADMIN',
          table_name: 'profiles',
          record_id: userId,
          old_values: { email: selectedUser?.email },
          new_values: { email: newEmail },
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (logError) console.warn('Failed to log action:', logError);
    },
    onSuccess: () => {
      toast.success('Email updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setNewEmail('');
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Failed to update email: ${error.message}`);
    }
  });

  // Account recovery mutation
  const accountRecoveryMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      // Log the recovery action
      const { error } = await supabase
        .from('audit_log')
        .insert({
          action: 'ACCOUNT_RECOVERY_INITIATED',
          table_name: 'profiles',
          record_id: userId,
          new_values: { reason, initiated_by: 'admin' },
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      // Here you would typically trigger email recovery or other recovery mechanisms
      // For now, we'll just log the action
    },
    onSuccess: () => {
      toast.success('Account recovery initiated');
      setRecoveryReason('');
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Failed to initiate recovery: ${error.message}`);
    }
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'EMAIL_RESET_BY_ADMIN':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'ACCOUNT_RECOVERY_INITIATED':
        return <RefreshCw className="h-4 w-4 text-green-500" />;
      case 'LOGIN':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED_LOGIN':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const UserActivityDialog = ({ user }: { user: UserProfile }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Activity - {user.first_name} {user.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {userActivity?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No activity found</p>
          ) : (
            <div className="space-y-2">
              {userActivity?.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.action)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {activity.action.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                    {activity.ip_address && (
                      <p className="text-xs text-gray-400">IP: {activity.ip_address}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.table_name}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const EmailResetDialog = ({ user }: { user: UserProfile }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="w-4 h-4 mr-1" />
          Reset Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset User Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Current Email</Label>
            <Input value={user.email || ''} disabled />
          </div>
          <div>
            <Label>New Email</Label>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              type="email"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetEmailMutation.mutate({ userId: user.id, newEmail });
              }}
              disabled={!newEmail || resetEmailMutation.isPending}
            >
              {resetEmailMutation.isPending ? 'Updating...' : 'Update Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const AccountRecoveryDialog = ({ user }: { user: UserProfile }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          Account Recovery
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Account Recovery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>User</Label>
            <Input value={`${user.first_name} ${user.last_name} (${user.email})`} disabled />
          </div>
          <div>
            <Label>Recovery Reason</Label>
            <Textarea
              value={recoveryReason}
              onChange={(e) => setRecoveryReason(e.target.value)}
              placeholder="Explain why account recovery is needed..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                accountRecoveryMutation.mutate({ userId: user.id, reason: recoveryReason });
              }}
              disabled={!recoveryReason || accountRecoveryMutation.isPending}
            >
              {accountRecoveryMutation.isPending ? 'Processing...' : 'Initiate Recovery'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Enhanced User Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        {user.is_admin && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {user.email}</p>
                        <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
                        <p>Last Updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <UserActivityDialog user={user} />
                      <EmailResetDialog user={user} />
                      <AccountRecoveryDialog user={user} />
                    </div>
                  </div>
                </div>
              ))}
              
              {users?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};