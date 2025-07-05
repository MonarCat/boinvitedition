import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  CreditCard,
  UserCheck,
  ClipboardList,
  Briefcase,
  LogOut,
  Menu,
  Home,
  DollarSign
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogoFallbackButton } from '@/components/ui/logo-fallback-button';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { FloatingActionButton } from '@/components/mobile/FloatingActionButton';
import { MobileGestures } from '@/components/mobile/MobileGestures';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { OfflineManager } from '@/components/mobile/OfflineManager';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Services', href: '/app/services', icon: Briefcase },
  { name: 'Bookings', href: '/app/bookings', icon: Calendar },
  { name: 'Clients', href: '/app/clients', icon: Users },
  { name: 'Staff', href: '/app/staff', icon: UserCheck },
  { name: 'Finance', href: '/app/finance', icon: DollarSign },
  { name: 'Invoices', href: '/app/invoices', icon: ClipboardList },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Subscription', href: '/app/subscription', icon: CreditCard },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const handleRefresh = async () => {
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  return (
    <MobileGestures>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white">
            <div className="flex h-16 shrink-0 items-center px-4">
              <LogoFallbackButton size="sm" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActive
                                ? 'bg-gray-50 text-blue-600'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                              }`}
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign out
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <LogoFallbackButton size="md" />
              <Button
                variant="outline"
                size="sm"
                onClick={goHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActive
                                ? 'bg-gray-50 text-blue-600'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                              }`}
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign out
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
          <LogoFallbackButton size="sm" />
          <Button variant="ghost" size="sm" onClick={goHome}>
            <Home className="w-4 h-4" />
          </Button>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          <main className="pb-20 lg:pb-10">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
              <PullToRefresh onRefresh={handleRefresh}>
                {children}
              </PullToRefresh>
            </div>
          </main>
        </div>

        {/* Mobile-specific components */}
        <BottomTabBar />
        <FloatingActionButton />
        <OfflineManager />
      </div>
    </MobileGestures>
  );
};
