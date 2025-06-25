
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp } from 'lucide-react';

export const DashboardStaffSection: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Staff Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/app/staff'}
        >
          <Users className="w-4 h-4 mr-2" />
          Manage Staff
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/app/staff-attendance'}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Staff Attendance
        </Button>
      </CardContent>
    </Card>
  );
};
