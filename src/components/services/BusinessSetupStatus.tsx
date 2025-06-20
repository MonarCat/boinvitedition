
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BusinessValidation {
  isValid: boolean;
  issues: string[];
}

interface BusinessSetupStatusProps {
  businessValidation: BusinessValidation | undefined;
  completeness: number;
}

export const BusinessSetupStatus: React.FC<BusinessSetupStatusProps> = ({
  businessValidation,
  completeness
}) => {
  if (!businessValidation) return null;

  return (
    <Card className={`${businessValidation.isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {businessValidation.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          )}
          Business Setup Status
          <Badge variant={businessValidation.isValid ? "default" : "secondary"} className="ml-2">
            {completeness}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {businessValidation.isValid ? (
          <p className="text-sm text-green-800">
            ✅ Your business is properly configured and ready for bookings!
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-orange-800 font-medium">Issues to fix:</p>
            <ul className="text-xs text-orange-700 space-y-1">
              {businessValidation.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
