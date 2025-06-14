
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCcw } from "lucide-react";

type KPIStats = {
  activeBookings: number;
  todayRevenue: number;
  monthlyBookings: number;
  totalClients: number;
};
type Props = {
  stats: KPIStats;
  currency: string;
  formatPrice: (a: number) => string;
  onRefresh: () => void;
  onEditBusiness: () => void;
};

export const DashboardKPISection: React.FC<Props> = ({
  stats, currency, formatPrice, onRefresh, onEditBusiness
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onRefresh}><RefreshCcw size={16} /></Button>
          <Edit size={16} onClick={onEditBusiness} className="cursor-pointer" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.activeBookings}</div>
        <p className="text-xs text-muted-foreground">Active appointments</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh}><RefreshCcw size={16} /></Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatPrice(stats.todayRevenue)}</div>
        <p className="text-xs text-muted-foreground">From confirmed bookings</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh}><RefreshCcw size={16} /></Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.monthlyBookings}</div>
        <p className="text-xs text-muted-foreground">This month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh}><RefreshCcw size={16} /></Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalClients}</div>
        <p className="text-xs text-muted-foreground">Registered clients</p>
      </CardContent>
    </Card>
  </div>
);
