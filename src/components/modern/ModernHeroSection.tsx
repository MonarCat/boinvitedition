import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ModernHeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="relative bg-gradient-to-b from-background to-muted/30 min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            Trusted by 617,493+ businesses worldwide
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Book local beauty and
              <br />
              <span className="text-highlight">wellness services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover and book appointments with top-rated salons, spas, and wellness professionals in your area.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Service Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="All treatments and venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-base h-12"
                />
              </div>

              {/* Location */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-base h-12"
                />
              </div>

              {/* Date */}
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Any date"
                  type="date"
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-base h-12"
                />
              </div>

              {/* Time & Search Button */}
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Any time"
                  type="time"
                  className="pl-10 border-0 bg-transparent focus:ring-0 text-base h-12"
                />
              </div>

            </div>
            
            <div className="mt-4 flex justify-center">
              <Button size="lg" className="px-8 py-3 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                Search
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              <span className="font-semibold text-foreground">617,493</span> appointments booked today
            </p>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/signup">
              <Button size="lg" variant="outline" className="px-8 py-3 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Get the app
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="px-8 py-3 rounded-xl text-muted-foreground hover:text-foreground">
                List your business
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModernHeroSection;