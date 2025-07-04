
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeTestPanelProps {
  businessId: string;
}

export const RealtimeTestPanel: React.FC<RealtimeTestPanelProps> = ({ businessId }) => {
  const [testAmount, setTestAmount] = useState('100');
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const createTestBooking = async () => {
    setIsCreatingTest(true);
    try {
      // First, create a test client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          business_id: businessId,
          name: 'Test Client',
          email: `test-${Date.now()}@example.com`,
          phone: '+254700000000'
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create test booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          client_id: client.id,
          service_id: '00000000-0000-0000-0000-000000000000', // Use a placeholder service ID
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: '10:00:00',
          duration_minutes: 60,
          total_amount: parseFloat(testAmount),
          status: 'confirmed',
          payment_status: 'completed',
          customer_name: 'Test Client',
          customer_email: client.email,
          customer_phone: client.phone
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create test payment transaction
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          business_id: businessId,
          booking_id: booking.id,
          amount: parseFloat(testAmount),
          business_amount: parseFloat(testAmount) * 0.95,
          platform_amount: parseFloat(testAmount) * 0.05,
          currency: 'KES',
          status: 'completed',
          payment_method: 'test',
          transaction_type: 'client_to_business'
        });

      if (paymentError) throw paymentError;

      // Create client business transaction
      const { error: transactionError } = await supabase
        .from('client_business_transactions')
        .insert({
          business_id: businessId,
          booking_id: booking.id,
          client_email: client.email,
          amount: parseFloat(testAmount),
          platform_fee: parseFloat(testAmount) * 0.05,
          business_amount: parseFloat(testAmount) * 0.95,
          status: 'completed',
          payment_method: 'test'
        });

      if (transactionError) throw transactionError;

      toast.success('Test Data Created!', {
        description: 'Real-time updates should now be visible in your dashboard'
      });

    } catch (error) {
      console.error('Error creating test data:', error);
      toast.error('Failed to create test data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsCreatingTest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testAmount">Test Amount (KES)</Label>
          <Input
            id="testAmount"
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            placeholder="100"
          />
        </div>
        
        <Button 
          onClick={createTestBooking}
          disabled={isCreatingTest}
          className="w-full"
        >
          {isCreatingTest ? 'Creating Test Data...' : 'Create Test Booking & Payment'}
        </Button>
        
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
          <strong>Note:</strong> This will create test data to verify real-time updates are working. 
          The dashboard should immediately show the new booking, payment, and client.
        </div>
      </CardContent>
    </Card>
  );
};
