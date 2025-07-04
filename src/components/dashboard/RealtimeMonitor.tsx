
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCompleteRealtime } from '@/hooks/useCompleteRealtime';
import { RealtimeTestPanel } from './RealtimeTestPanel';

interface Booking {
  id: string;
  customer_name?: string;
  service_name?: string;
  created_at: string;
  business_id: string;
  total_amount?: number;
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
  
  const { 
    connectionStatus, 
    connectionError, 
    isFullyConnected, 
    connectedCount, 
    totalConnections,
    forceReconnect 
  } = useCompleteRealtime({ businessId, enableToasts: true });

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
          <h2 className="text-2xl font-bold">Real-time Dashboard Monitor</h2>
          {isFullyConnected ? (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
              All Connected ({connectedCount}/{totalConnections})
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
              <span className="w-2 h-2 mr-2 bg-yellow-500 rounded-full"></span>
              Partial ({connectedCount}/{totalConnections})
            </span>
          )}
        </div>
        
        <Button 
          onClick={forceReconnect} 
          variant="outline" 
          size="sm"
        >
          Reconnect All
        </Button>
      </div>
      
      {connectionError && (
        <Alert variant="destructive">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Real-time Test Panel */}
      <RealtimeTestPanel businessId={businessId} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Bookings</span>
              <span className={`w-3 h-3 rounded-full ${connectionStatus.bookings ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </CardTitle>
            <CardDescription>
              Latest booking activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <ul className="space-y-2">
                {bookings.map((booking) => (
                  <li key={booking.id} className="p-2 bg-slate-50 rounded-md text-sm">
                    <div className="font-medium">{booking.customer_name || 'Unknown Client'}</div>
                    <div className="text-slate-500">KES {Number(booking.total_amount || 0).toLocaleString()}</div>
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
            <CardTitle className="flex items-center justify-between">
              <span>Recent Payments</span>
              <span className={`w-3 h-3 rounded-full ${connectionStatus.payments ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </CardTitle>
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
            <CardTitle className="flex items-center justify-between">
              <span>Recent Clients</span>
              <span className={`w-3 h-3 rounded-full ${connectionStatus.clients ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </CardTitle>
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Real-Time Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(connectionStatus).map(([key, connected]) => (
            <div key={key} className={`flex items-center gap-2 p-2 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-blue-700 mt-3">
          {isFullyConnected 
            ? "✅ All real-time connections are active. Your dashboard will update instantly when new data arrives."
            : "⚠️ Some connections are down. Updates may be delayed. Click 'Reconnect All' to restore full functionality."
          }
        </p>
      </div>
    </div>
  );
};
