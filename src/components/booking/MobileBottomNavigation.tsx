import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, User, Menu, Phone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BookingStep = 
  'serviceSelection' | 
  'clientDetails' | 
  'calendar' | 
  'staffSelection' | 
  'payment' | 
  'confirmation';

interface MobileBottomNavigationProps {
  currentStep: BookingStep;
  onChangeStep?: (step: BookingStep) => void;
  disabledSteps?: BookingStep[];
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ 
  currentStep, 
  onChangeStep,
  disabledSteps = [] 
}) => {
  const navItems = [
    { 
      id: 'serviceSelection' as BookingStep, 
      icon: Menu, 
      label: 'Services' 
    },
    { 
      id: 'clientDetails' as BookingStep, 
      icon: User, 
      label: 'Details' 
    },
    { 
      id: 'calendar' as BookingStep, 
      icon: Calendar, 
      label: 'Time' 
    },
    { 
      id: 'payment' as BookingStep, 
      icon: CreditCard, 
      label: 'Payment' 
    },
    { 
      id: 'confirmation' as BookingStep, 
      icon: Check, 
      label: 'Confirm' 
    },
  ];

  // Find the index of the current step
  const currentIndex = navItems.findIndex(item => item.id === currentStep);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-lg z-50 pb-safe-area"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-1 bg-gray-100 dark:bg-slate-800 w-full relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-blue-500"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${Math.min(100, (currentIndex / (navItems.length - 1)) * 100)}%` 
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>

      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isDisabled = disabledSteps.includes(item.id);
          const isActive = currentStep === item.id;
          const isCompleted = navItems.findIndex(i => i.id === item.id) < currentIndex;
          
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onChangeStep?.(item.id)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                isCompleted && !isActive ? "text-blue-400 dark:text-blue-300" : "",
              )}
              aria-label={`Go to ${item.label} step`}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 mb-1 transition-transform",
                  isActive && "scale-110"
                )} />
                {isCompleted && !isActive && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
