import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { SimpleRealtimeStatus } from "@/components/dashboard/SimpleRealtimeStatus";

type Props = {
  business: {
    id: string;
    name: string;
    [key: string]: unknown;
  } | null;
  theme: string;
  setTheme: (t: string) => void;
  onNewBooking: () => void;
  isConnected?: boolean;
  connectionError?: string | null;
  onReconnect?: () => void;
};

export const DashboardHeader: React.FC<Props> = ({
  business,
  theme,
  setTheme,
  onNewBooking,
  isConnected,
  connectionError,
  onReconnect
}) => (
  <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-lg">
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Dashboard</h1>
          {isConnected !== undefined && connectionError !== undefined && (
            <SimpleRealtimeStatus 
              isConnected={isConnected}
              connectionError={connectionError}
              onReconnect={onReconnect}
            />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {business ? `Welcome back to ${business.name}` : "Manage your bookings, invoices, and clients"}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Pay As You Go
        </Badge>
        <Button onClick={onNewBooking}>+ New Booking</Button>
      </div>
    </div>
  </div>
);
