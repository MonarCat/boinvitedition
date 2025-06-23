
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Smartphone, User } from 'lucide-react';
import { submitAttendance } from '@/lib/offlineAttendance';
import { OfflineAttendanceIndicator } from './OfflineAttendanceIndicator';

interface EnhancedAttendanceFormProps {
  staff: any;
  businessId: string;
  onSuccess?: () => void;
}

export const EnhancedAttendanceForm = ({ staff, businessId, onSuccess }: EnhancedAttendanceFormProps) => {
  const [notes, setNotes] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSubmit = async (action: 'signed_in' | 'signed_out') => {
    if (!pinCode || pinCode.length !== 4) {
      alert('Please enter a valid 4-digit PIN code');
      return;
    }

    // In a real implementation, you'd verify the PIN against the staff record
    if (pinCode !== '1234') { // Demo PIN
      alert('Invalid PIN code');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAttendance(staff.id, businessId, action, notes || undefined);
      
      if (result.success) {
        setLastAction(action);
        setNotes('');
        setPinCode('');
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <OfflineAttendanceIndicator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {staff.name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{staff.email}</span>
            {staff.shift && <Badge variant="outline">{staff.shift}</Badge>}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pin">PIN Code *</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.slice(0, 4))}
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">Demo PIN: 1234</p>
            </div>
            
            <div>
              <Label>Current Time</Label>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this attendance entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSubmit('signed_in')}
              disabled={isSubmitting || !pinCode}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Button
              onClick={() => handleSubmit('signed_out')}
              disabled={isSubmitting || !pinCode}
              variant="outline"
            >
              {isSubmitting ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>

          {lastAction && (
            <div className="text-center">
              <Badge variant={lastAction === 'signed_in' ? 'default' : 'secondary'}>
                Last action: {lastAction.replace('_', ' ')} at {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Device Information</h4>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Smartphone className="h-3 w-3" />
                Browser: {navigator.userAgent.split('(')[0].trim()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Location: {navigator.geolocation ? 'Available' : 'Not available'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
