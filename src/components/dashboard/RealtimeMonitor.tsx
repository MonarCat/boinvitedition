import React, { useState, useEffect } from 'react';
import { useSimpleRealtime } from '@/hooks/useSimpleRealtime';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  client_name?: string;
  service_name?: string;
  created_at: string;
  business_id: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method?: string;
  created_at: string;
  business_id: string;
}

interface Client {
  id: string;
  name?: string;
  email?: string;
  created_at: string;
  business_id: string;
}

interface RealtimeMonitorProps {
  businessId: string;
}

export const RealtimeMonitor: React.FC<RealtimeMonitorProps> = ({ businessId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const { isConnected, error, forceReconnect } = useSimpleRealtime({
    businessId,
    showToasts: true
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (bookingsData) {
          setBookings(bookingsData);
        }
        
        // Fetch recent payments
        const { data: paymentsData } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (paymentsData) {
          setPayments(paymentsData);
        }
        
        // Fetch recent clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (clientsData) {
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, [businessId]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Real-time Dashboard</h2>
          {isConnected ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
              Offline
            </span>
          )}
        </div>
        
        <Button 
          onClick={forceReconnect} 
          variant="outline" 
          size="sm"
        >
          Reconnect
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <ul className="space-y-2">
                {bookings.map((booking) => (
                  <li key={booking.id} className="p-2 bg-slate-50 rounded-md text-sm">
                    <div className="font-medium">{booking.client_name || 'Unknown Client'}</div>
                    <div className="text-slate-500">{booking.service_name || 'Service'}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(booking.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recent bookings</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>
              Latest payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <ul className="space-y-2">
                {payments.map((payment) => (
                  <li key={payment.id} className="p-2 bg-slate-50 rounded-md text-sm">
                    <div className="font-medium">
                      KES {Number(payment.amount).toLocaleString()}
                    </div>
                    <div className="text-slate-500">{payment.payment_method || 'Payment'}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(payment.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recent payments</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>
              Latest client sign-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <ul className="space-y-2">
                {clients.map((client) => (
                  <li key={client.id} className="p-2 bg-slate-50 rounded-md text-sm">
                    <div className="font-medium">{client.name || 'Unknown Client'}</div>
                    <div className="text-slate-500">{client.email || 'No email'}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(client.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recent clients</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <p className="text-sm text-slate-500 text-center mt-4">
        {isConnected 
          ? "Real-time updates are active - new data will appear automatically"
          : "Real-time updates are currently disabled - please reconnect or refresh the page"
        }
      </p>
    </div>
  );
};
