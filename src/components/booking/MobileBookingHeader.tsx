
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileBookingHeaderProps {
  business: any;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
}

export const MobileBookingHeader: React.FC<MobileBookingHeaderProps> = ({ 
  business, 
  children,
  showBackButton = false,
  onBackClick,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Enhanced App-like Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackClick}
              className="text-white hover:bg-white/10 p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {business?.name?.charAt(0) || 'B'}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {title || business?.name || 'Book Service'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 text-xs border-green-400/30">
                ● Available
              </Badge>
              {business?.location && (
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-20">{business.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {business?.phone && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/10 p-2 rounded-full"
              onClick={() => window.open(`tel:${business.phone}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10 p-2 rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full max-w-sm bg-white p-0 border-l-0"
            >
              {/* Sheet Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {business?.name?.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{business?.name || 'Business'}</h2>
                    <p className="text-xs text-blue-100">{business?.category || 'Services'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sheet Content */}
              <div className="py-4 px-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                {children}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content Container */}
      <div className="bg-gray-50 min-h-[calc(100vh-64px)] pb-safe">
        <div className="p-4">
          {!isOpen && children}
        </div>
      </div>
    </div>
  );
};
