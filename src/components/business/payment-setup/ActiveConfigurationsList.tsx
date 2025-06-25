
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActiveConfigurationsListProps {
  configs: any[];
}

export const ActiveConfigurationsList: React.FC<ActiveConfigurationsListProps> = ({ configs }) => {
  if (configs.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t">
      <h4 className="font-medium mb-2">Active Configurations</h4>
      <div className="space-y-2">
        {configs.map((config) => (
          <div key={config.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">{config.payment_type}</span>
            <Badge variant={config.is_active ? "default" : "secondary"}>
              {config.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
