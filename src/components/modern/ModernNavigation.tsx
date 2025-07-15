import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const ModernNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-foreground">
              boinvit
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/login" className="text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-foreground hover:text-primary transition-colors">
              List your business
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-foreground">Menu</span>
              <Menu className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-4">
              <Link 
                to="/login" 
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                List your business
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavigation;