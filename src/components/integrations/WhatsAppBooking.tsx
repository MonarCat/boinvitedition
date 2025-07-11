import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MessageCircle, Phone, Check, Clock, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppStats {
  totalBookings: number;
  responseRate: number;
  avgResponseTime: string;
  activeChats: number;
}

interface WhatsAppBookingProps {
  businessId: string;
}

export const WhatsAppBooking: React.FC<WhatsAppBookingProps> = ({ businessId }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [stats] = useState<WhatsAppStats>({
    totalBookings: 247,
    responseRate: 94,
    avgResponseTime: '2.3 min',
    activeChats: 12
  });

  const [recentBookings] = useState([
    { id: '1', customer: 'Maria Santos', service: 'Haircut', time: '2:30 PM', status: 'confirmed' },
    { id: '2', customer: 'Ahmed Ali', service: 'Massage', time: '4:00 PM', status: 'pending' },
    { id: '3', customer: 'Lisa Chen', service: 'Facial', time: '10:00 AM', status: 'confirmed' }
  ]);

  return (
    <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-green-700">
          <div className="p-2 rounded-lg bg-green-100">
            <MessageCircle className="h-5 w-5" />
          </div>
          WhatsApp Booking
          <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
            <Globe className="h-3 w-3 mr-1" />
            Global
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <span className="text-sm font-medium">Enable WhatsApp Bookings</span>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Business Phone Number</label>
          <div className="flex gap-2">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/60 border border-green-200/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Bookings</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.totalBookings}</div>
            <div className="text-xs text-green-600">+23% this month</div>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-green-200/50">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Response Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.responseRate}%</div>
            <div className="text-xs text-green-600">Above industry avg</div>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-green-200/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.avgResponseTime}</div>
            <div className="text-xs text-green-600">Very fast</div>
          </div>

          <div className="p-3 rounded-lg bg-white/60 border border-green-200/50">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active Chats</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.activeChats}</div>
            <div className="text-xs text-green-600">Live now</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Recent WhatsApp Bookings</div>
          <div className="space-y-2">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/60 border border-green-200/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{booking.customer}</div>
                    <div className="text-xs text-muted-foreground">{booking.service} • {booking.time}</div>
                  </div>
                </div>
                <Badge 
                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {booking.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-green-200">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Configure WhatsApp Integration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};