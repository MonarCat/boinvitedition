
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  FileText,
  UserCheck,
  Clock,
  LogOut,
  User,
  BarChart3,
  Building2,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();

  // Get business data for logo
  const { data: business } = useQuery({
    queryKey: ['sidebar-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('name, logo_url')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/app/bookings', icon: Calendar },
    { name: 'Services', href: '/app/services', icon: FileText },
    { name: 'Staff', href: '/app/staff', icon: Users },
    { name: 'Attendance', href: '/app/staff-attendance', icon: Clock },
    { name: 'Staff Dashboard', href: '/app/staff-dashboard', icon: BarChart3 },
    { name: 'Clients', href: '/app/clients', icon: UserCheck },
    { name: 'Invoices', href: '/app/invoices', icon: FileText },
    { name: 'Subscription', href: '/app/subscription', icon: CreditCard },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === '/app/dashboard' || location.pathname === '/app' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200">
        <div className="flex h-full flex-col">
          {/* Enhanced Logo Section */}
          <div className="flex h-20 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-700">
            <Link to="/" className="flex items-center gap-3 group" tabIndex={0} aria-label="Home">
              {business?.logo_url ? (
                <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-md">
                  <img 
                    src={business.logo_url} 
                    alt="Business Logo" 
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="text-white">
                <h1 className="text-xl font-bold group-hover:text-blue-100 transition-colors">
                  {business?.name || 'Boinvit'}
                </h1>
                <p className="text-xs text-blue-100">Business Manager</p>
              </div>
            </Link>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {item.name}
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Enhanced User Section */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Business Owner</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content with enhanced styling */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
