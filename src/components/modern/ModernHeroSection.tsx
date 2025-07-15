import { useState } from "react";
import { ModernButton } from "@/components/ui/modern-button";
import { ModernInput } from "@/components/ui/modern-input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ModernHeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="relative bg-gradient-hero min-h-[95vh] flex items-center overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          
          {/* Enhanced Badge */}
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="px-6 py-3 text-sm font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 617,493+ businesses worldwide
            </Badge>
          </div>

          {/* Enhanced Main Heading */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-6xl md:text-8xl font-poppins font-bold text-white leading-tight tracking-tight">
              Book local beauty and
              <br />
              <span className="text-gradient bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
                wellness services
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light">
              Discover and book appointments with top-rated salons, spas, and wellness professionals in your area.
            </p>
          </div>

          {/* Enhanced Search Form */}
          <div className="max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="glass rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                
                {/* Service Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Service</label>
                  <ModernInput
                    placeholder="All treatments and venues"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                    variant="ghost"
                    inputSize="lg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Location</label>
                  <ModernInput
                    placeholder="Current location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    icon={<MapPin className="w-5 h-5" />}
                    variant="ghost"
                    inputSize="lg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Date</label>
                  <ModernInput
                    placeholder="Any date"
                    type="date"
                    icon={<Calendar className="w-5 h-5" />}
                    variant="ghost"
                    inputSize="lg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  />
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-transparent select-none">Search</label>
                  <ModernButton 
                    size="lg" 
                    variant="accent"
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-accent hover:shadow-xl transition-all duration-300"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    Search
                  </ModernButton>
                </div>

              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <p className="text-white/70 text-lg md:text-xl">
              <span className="font-semibold text-white text-2xl md:text-3xl">617,493</span> appointments booked today
            </p>
          </div>

          {/* Enhanced CTA Section */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <Link to="/auth">
              <ModernButton 
                size="xl" 
                variant="outline" 
                className="px-10 py-4 rounded-xl border-white/20 text-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get the app
              </ModernButton>
            </Link>
            <Link to="/auth">
              <ModernButton 
                size="xl" 
                variant="ghost" 
                className="px-10 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-semibold transition-all duration-300"
              >
                List your business
              </ModernButton>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModernHeroSection;