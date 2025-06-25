
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings,
  Briefcase,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const tabs: TabItem[] = [
  { name: 'Home', href: '/app/dashboard', icon: Home },
  { name: 'Services', href: '/app/services', icon: Briefcase },
  { name: 'Bookings', href: '/app/bookings', icon: Calendar },
  { name: 'Clients', href: '/app/clients', icon: Users },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export const BottomTabBar = () => {
  const location = useLocation();

  // Only show on authenticated app routes
  if (!location.pathname.startsWith('/app/')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb lg:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600 active:bg-gray-100"
              )}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "text-blue-600")} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium truncate",
                isActive ? "text-blue-600" : "text-gray-600"
              )}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
