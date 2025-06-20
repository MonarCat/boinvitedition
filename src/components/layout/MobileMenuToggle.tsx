
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface MobileMenuToggleProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ 
  children, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`md:hidden ${className}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
