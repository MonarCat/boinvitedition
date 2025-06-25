
import React, { useState } from 'react';
import { Plus, Calendar, Users, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  color: string;
}

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on authenticated app routes
  if (!location.pathname.startsWith('/app/')) {
    return null;
  }

  const actions: FABAction[] = [
    {
      icon: Calendar,
      label: 'New Booking',
      action: () => navigate('/app/bookings?action=new'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Briefcase,
      label: 'New Service',
      action: () => navigate('/app/services?action=new'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Users,
      label: 'New Client',
      action: () => navigate('/app/clients?action=new'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleMainAction = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: FABAction) => {
    action.action();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:hidden">
      {/* Action buttons */}
      <div className={cn(
        "space-y-3 transition-all duration-300 mb-3",
        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="flex items-center gap-3"
              style={{
                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
              }}
            >
              <span className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {action.label}
              </span>
              <Button
                onClick={() => handleActionClick(action)}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg text-white border-0",
                  action.color
                )}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={handleMainAction}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl transition-all duration-300",
          isExpanded 
            ? "bg-red-500 hover:bg-red-600 rotate-45" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </Button>
    </div>
  );
};
