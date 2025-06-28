
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings,
  Briefcase
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
    <div className="bottom-nav">
      <div className="flex justify-around items-center max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "mobile-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative",
                isActive 
                  ? "text-blue-600 bg-gradient-to-t from-blue-50 to-blue-100 shadow-lg transform -translate-y-1" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100"
              )}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200", 
                  isActive && "text-blue-600 scale-110"
                )} />
                {tab.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium truncate transition-all duration-200",
                isActive ? "text-blue-600 font-semibold" : "text-gray-600"
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
