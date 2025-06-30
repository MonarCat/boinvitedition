import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const PaygBanner = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500 text-white py-1 px-3">
                <Star className="w-3 h-3 mr-1" />
                NEW
              </Badge>
              <h3 className="text-xl font-bold text-orange-800">
                Introducing Pay As You Go!
              </h3>
            </div>
            <p className="text-orange-700">
              No monthly fees - Only pay a small 5% commission when you get paid by clients.
            </p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              <li className="text-sm flex items-center text-orange-700">
                ✓ No monthly subscription
              </li>
              <li className="text-sm flex items-center text-orange-700">
                ✓ Unlimited staff members
              </li>
              <li className="text-sm flex items-center text-orange-700">
                ✓ Full platform access
              </li>
              <li className="text-sm flex items-center text-orange-700">
                ✓ Priority support
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={() => navigate('/app/subscription')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              Switch to PAYG Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
