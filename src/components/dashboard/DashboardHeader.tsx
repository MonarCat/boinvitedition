import React from 'react';
import { Bell, Calendar, RefreshCw, Users, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleRealtimeStatus } from "@/components/dashboard/SimpleRealtimeStatus";

// Explicitly define badge variant types
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success";

interface BadgeConfig {
  variant: BadgeVariant;
  text: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefreshTime?: number | null;
  hasSearch?: boolean;
  onSearch?: (query: string) => void;
  quickActions?: boolean;
  business?: {
    id: string;
    name: string;
    [key: string]: unknown;
  } | null;
  theme?: string;
  setTheme?: (t: string) => void;
  onNewBooking?: () => void;
  isConnected?: boolean;
  connectionError?: string | null;
  onReconnect?: () => void;
  badge?: BadgeConfig;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  lastRefreshTime,
  hasSearch = false,
  onSearch,
  quickActions = true,
  business,
  theme,
  setTheme,
  onNewBooking,
  isConnected,
  connectionError,
  onReconnect,
  badge
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 shadow-sm mb-6 border p-4 lg:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
              {badge && (
                <Badge variant={badge.variant} className="ml-2">
                  {badge.text}
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            {lastRefreshTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh} 
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
          </div>
        </div>

        {(hasSearch || quickActions) && (
          <div className="flex flex-col md:flex-row gap-4 justify-between mt-2">
            {hasSearch && (
              <div className="relative md:max-w-md w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            )}

            {quickActions && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/bookings/new">
                    <Calendar className="h-4 w-4 mr-1" />
                    New Booking
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/clients/new">
                    <Users className="h-4 w-4 mr-1" />
                    Add Client
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/app/settings" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/app/notifications" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {badge && (
          <div className={`mt-4 ${badge.variant}`}>
            <Badge>
              {badge.text}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
