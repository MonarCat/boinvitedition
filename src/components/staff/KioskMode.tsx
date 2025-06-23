
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { submitAttendance } from '@/lib/offlineAttendance';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KioskModeProps {
  businessId: string;
}

export const KioskMode = ({ businessId }: KioskModeProps) => {
  const [pinCode, setPinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<{ action: string; staff: string; time: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Clear last action after 5 seconds
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const { data: staff } = useQuery({
    queryKey: ['kiosk-staff', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, email')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const handleSubmit = async (action: 'signed_in' | 'signed_out') => {
    if (!pinCode || pinCode.length !== 4) {
      return;
    }

    // Find staff by PIN (in real implementation, this would be properly secured)
    const staffMember = staff?.find((_, index) => `${1000 + index}` === pinCode);
    
    if (!staffMember) {
      setPinCode('');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAttendance(staffMember.id, businessId, action);
      
      if (result.success) {
        setLastAction({
          action: action === 'signed_in' ? 'Signed In' : 'Signed Out',
          staff: staffMember.name,
          time: new Date().toLocaleTimeString()
        });
        setPinCode('');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pinCode.length < 4) {
      setPinCode(prev => prev + digit);
    }
  };

  const clearPin = () => setPinCode('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant={isOnline ? 'default' : 'destructive'} className="text-sm">
                {isOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <div className="text-2xl font-mono font-bold">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Staff Attendance Kiosk</CardTitle>
            <p className="text-gray-600 text-lg">Enter your 4-digit PIN to sign in or out</p>
          </CardHeader>
        </Card>

        {/* Success Message */}
        {lastAction && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-800 mb-1">
                {lastAction.action} Successfully!
              </h3>
              <p className="text-green-700">
                {lastAction.staff} at {lastAction.time}
              </p>
            </CardContent>
          </Card>
        )}

        {/* PIN Input */}
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold bg-white"
                  >
                    {pinCode[index] ? '●' : ''}
                  </div>
                ))}
              </div>
              
              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="lg"
                    className="h-16 text-xl font-semibold"
                    onClick={() => handlePinInput(num.toString())}
                    disabled={isSubmitting}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-xl font-semibold"
                  onClick={clearPin}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-xl font-semibold"
                  onClick={() => handlePinInput('0')}
                  disabled={isSubmitting}
                >
                  0
                </Button>
                <div /> {/* Empty space */}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubmit('signed_in')}
                  disabled={pinCode.length !== 4 || isSubmitting}
                >
                  <User className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg"
                  onClick={() => handleSubmit('signed_out')}
                  disabled={pinCode.length !== 4 || isSubmitting}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-6">
              <p>PIN Format: Staff member index + 1000</p>
              <p>Example: First staff member = 1000, Second = 1001, etc.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Tap numbers to enter your PIN, then choose Sign In or Sign Out</p>
        </div>
      </div>
    </div>
  );
};
