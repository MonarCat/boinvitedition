import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CleanBookingLayoutProps {
  children: React.ReactNode;
  className?: string;
  businessName?: string;
  hideBackButton?: boolean;
}

export const CleanBookingLayout: React.FC<CleanBookingLayoutProps> = ({ 
  children, 
  className,
  businessName,
  hideBackButton = false
}) => {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Track scroll position to show/hide the header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Check for user's preferred color scheme
  useEffect(() => {
    // Check if the user prefers dark mode or has previously set it
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('boinvit-theme');
    
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('boinvit-theme', newMode ? 'dark' : 'light');
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black text-slate-800 dark:text-slate-200">
      {/* Mobile App-like fixed header - only shown on mobile */}
      {isMobile && (
        <motion.header 
          className={cn(
            "fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 backdrop-blur-md transition-shadow",
            scrolled ? "shadow-md bg-opacity-90 dark:bg-opacity-90" : "",
            "safe-area-inset-top" // Add safe area padding for iPhone notches
          )}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center h-14 px-4">
            {!hideBackButton && (
              <button 
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Go back"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {businessName && (
              <h1 className={cn(
                "font-semibold truncate flex-1 text-center",
                hideBackButton ? "" : "ml-2"
              )}>
                {businessName}
              </h1>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.header>
      )}
      
      <main className={cn(
        "flex-1 container mx-auto px-4", 
        isMobile ? "pt-20 pb-4" : "py-8", 
        className
      )}>
        <div className={cn(
          isMobile && "touch-manipulation overscroll-none" // Better touch handling
        )}>
          {children}
        </div>
      </main>
      
      {/* Mobile safe area for iOS devices, taller for bottom navigation */}
      {isMobile && <div className="h-24 bg-transparent" />}
    </div>
  );
};
