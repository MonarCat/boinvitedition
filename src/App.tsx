import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SupabaseProvider } from "@/context/SupabaseProvider";
import { BookingProvider } from "./context/BookingContext";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { preloadPaystackScript } from "@/components/payment/PaystackScriptLoader";
import AuthenticatedApp from "@/pages/AuthenticatedApp";
import LandingPage from "@/pages/LandingPage";
import DemoPage from "@/pages/DemoPage";
import DiscoverPage from "@/pages/DiscoverPage";
import SafetyPage from "@/pages/SafetyPage";
import AppDownloadPage from "@/pages/AppDownloadPage";
import BookingPage from "@/pages/BookingPage";
import AuthPage from "@/pages/AuthPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import { EnhancedPWAManager } from "@/components/pwa/EnhancedPWAManager";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";
import { WhatsAppFAB } from "@/components/ui/WhatsAppFAB";
import { MotionConfig } from "framer-motion";

// App configuration
const BREAKPOINTS = {
  mobile: 'max-w-sm',
  tablet: 'max-w-4xl',
  desktop: 'max-w-7xl'
};

const APP_VERSION = "1.2.3";

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [highContrastMode, setHighContrastMode] = React.useState(false);
  
  // Check for accessibility preferences
  React.useEffect(() => {
    // Check for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    // Check for high contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrastMode(contrastQuery.matches);
    
    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrastMode(e.matches);
    
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // PWA setup and Paystack preloading
  React.useEffect(() => {
    // Preload Paystack script if on booking pages
    const currentPath = window.location.pathname;
    if (currentPath.includes('/booking') || currentPath.includes('/app')) {
      preloadPaystackScript();
    }
  }, []);

  // App information logging
  React.useEffect(() => {
    console.log(`
🎉 Boinvit Application Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Version: ${APP_VERSION}
🎨 Theme: Dynamic (Light/Dark mode support)
📱 Responsive: Enabled (Mobile-first design)
♿ Accessibility: Enhanced
   • Reduced Motion: ${prefersReducedMotion ? 'Enabled' : 'Disabled'}
   • High Contrast: ${highContrastMode ? 'Enabled' : 'Disabled'}
📏 Breakpoints: ${JSON.stringify(BREAKPOINTS, null, 2)}
🔧 Features:
   • PWA Support ✓
   • Real-time Updates ✓
   • Payment Integration ✓
   • Multi-language Support ✓
   • WhatsApp Integration ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }, [prefersReducedMotion, highContrastMode]);


  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BookingProvider>
              <TooltipProvider>
                <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
                  <div className="min-h-screen transition-colors duration-300">
                    <SecurityHeaders />
                    
                    <BrowserRouter>
                      <Routes>
                        {/* Landing page */}
                        <Route path="/" element={<LandingPage />} />
                        
                        {/* Public pages */}
                        <Route path="/demo" element={<DemoPage />} />
                        <Route path="/discover" element={<DiscoverPage />} />
                        <Route path="/safety" element={<SafetyPage />} />
                        <Route path="/app-download" element={<AppDownloadPage />} />
                        
                        {/* Authentication */}
                        <Route path="/auth" element={<AuthPage />} />
                        
                        {/* Public booking pages */}
                        <Route path="/booking/:businessId" element={<BookingPage />} />
                        <Route path="/b/:subdomain" element={<BookingPage />} />
                        
                        {/* Authenticated application */}
                        <Route path="/app/*" element={<AuthenticatedApp />} />
                        
                        {/* Legal pages */}
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        
                        {/* 404 page */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                    
                    <Toaster 
                      position="top-center"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                          border: '1px solid hsl(var(--border))',
                        },
                      }}
                    />
                    
                    <EnhancedPWAManager />
                    <UpdateNotification />
                    <WhatsAppFAB />
                  </div>
                </MotionConfig>
              </TooltipProvider>
            </BookingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};

export default App;