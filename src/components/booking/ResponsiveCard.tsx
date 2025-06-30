import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  showShadow?: boolean;
  noPadding?: boolean;
  animate?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  className,
  showShadow = true,
  noPadding = false,
  animate = true
}) => {
  const isMobile = useIsMobile();
  
  const content = (
    <Card 
      className={cn(
        "overflow-hidden mb-6 w-full transition-all", 
        showShadow ? "shadow-md" : "shadow-none border-0",
        isMobile ? "rounded-xl" : "rounded-lg",
        className
      )}
    >
      <CardContent className={cn(
        noPadding ? "p-0" : isMobile ? "p-4 sm:p-6" : "p-6",
      )}>
        {children}
      </CardContent>
    </Card>
  );
  
  if (!animate) {
    return content;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1
      }}
    >
      {content}
    </motion.div>
  );
};
