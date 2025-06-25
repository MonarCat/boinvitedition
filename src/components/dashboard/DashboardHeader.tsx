
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import React from "react";

type Props = {
  business: any;
  onNewBooking: () => void;
};

export const DashboardHeader: React.FC<Props> = ({
  business,
  onNewBooking
}) => (
  <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-lg transition-colors duration-200">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {business ? `Welcome back to ${business.name}` : "Manage your bookings, invoices, and clients"}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
          Pro Plan
        </Badge>
        <Button onClick={onNewBooking}>+ New Booking</Button>
      </div>
    </div>
  </div>
);
