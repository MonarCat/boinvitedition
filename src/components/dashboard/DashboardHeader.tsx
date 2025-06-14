
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
  business: any;
  theme: string;
  setTheme: (t: string) => void;
  onNewBooking: () => void;
};

export const DashboardHeader: React.FC<Props> = ({
  business,
  theme,
  setTheme,
  onNewBooking
}) => (
  <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {business ? `Welcome back to ${business.name}` : "Manage your bookings, invoices, and clients"}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <select
          value={theme}
          onChange={e => setTheme(e.target.value as string)}
          className="p-2 rounded border bg-white dark:bg-gray-800 text-sm"
          aria-label="Theme selection"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Pro Plan
        </Badge>
        <Button onClick={onNewBooking}>+ New Booking</Button>
      </div>
    </div>
  </header>
);
