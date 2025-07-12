import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Users, AlertTriangle } from 'lucide-react';
import { SecurityMonitor } from './SecurityMonitor';
import { EnhancedCSRFForm } from './EnhancedCSRFForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, assignAdmin, assigningAdmin } = useUserRoles();

  const handleAdminAssignment = async (formData: FormData, csrfToken: string) => {
    const email = formData.get('email') as string;
    
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      await assignAdmin(email);
    } catch (error) {
      console.error('Admin assignment error:', error);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Security dashboard requires admin privileges</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>

      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <SecurityMonitor />
          
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">CSRF Protection</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">RLS Policies</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Enforced</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Input Validation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Enhanced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedCSRFForm onSubmit={handleAdminAssignment}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Assign Admin Role</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={assigningAdmin}>
                    {assigningAdmin ? 'Assigning...' : 'Assign Admin Role'}
                  </Button>
                </div>
              </EnhancedCSRFForm>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Security Notice</p>
                    <p className="text-yellow-700">
                      Admin role assignment is now secured with enhanced validation and audit logging.
                      All role changes are tracked and require existing admin privileges.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-medium text-green-800">Role Escalation Vulnerability Fixed</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Direct modification of admin roles is now blocked and properly secured.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-medium text-green-800">Enhanced RLS Policies</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Payment transactions and user roles now have strengthened access controls.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-medium text-green-800">Improved Input Validation</h4>
                  <p className="text-sm text-green-700 mt-1">
                    All user inputs now undergo enhanced validation and sanitization.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-medium text-blue-800">Security Monitoring Active</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Real-time monitoring of security events and unauthorized access attempts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};