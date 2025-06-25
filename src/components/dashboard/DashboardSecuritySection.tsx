
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSecurityDashboard } from '@/components/security/EnhancedSecurityDashboard';
import { Shield } from 'lucide-react';

export const DashboardSecuritySection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Enhanced Security Monitoring
        </CardTitle>
        <p className="text-sm text-gray-600">
          Real-time security monitoring with comprehensive threat detection
        </p>
      </CardHeader>
      <CardContent>
        <EnhancedSecurityDashboard />
      </CardContent>
    </Card>
  );
};
