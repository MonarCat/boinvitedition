import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Calendar, PenSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ClientNavigationProps {
  className?: string;
  compact?: boolean;
}

export const ClientNavigation: React.FC<ClientNavigationProps> = ({ 
  className,
  compact = false 
}) => {
  return (
    <motion.div 
      className={cn(
        "flex flex-col md:flex-row gap-2 md:gap-4",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Link to="/booking/manage">
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={cn(
            "transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <Search className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
          {compact ? 'Find Booking' : 'Find My Booking'}
        </Button>
      </Link>
      
      <Link to="/booking/manage">
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={cn(
            "transition-all hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <Calendar className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
          {compact ? 'Reschedule' : 'Reschedule Booking'}
        </Button>
      </Link>
      
      <Link to="/booking/manage">
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={cn(
            "transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-300",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <PenSquare className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
          {compact ? 'Review' : 'Write a Review'}
        </Button>
      </Link>
    </motion.div>
  );
};
