
import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileGesturesProps {
  children: React.ReactNode;
}

export const MobileGestures: React.FC<MobileGesturesProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const routes = [
    '/app/dashboard',
    '/app/services', 
    '/app/bookings',
    '/app/clients',
    '/app/settings'
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      
      // Only trigger swipe if horizontal movement is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
        const currentIndex = routes.indexOf(location.pathname);
        
        if (currentIndex !== -1) {
          if (deltaX > 0 && currentIndex > 0) {
            // Swipe right - go to previous tab
            navigate(routes[currentIndex - 1]);
          } else if (deltaX < 0 && currentIndex < routes.length - 1) {
            // Swipe left - go to next tab
            navigate(routes[currentIndex + 1]);
          }
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, location.pathname]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
};
