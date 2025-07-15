import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Sparkles, Heart, Car, Users, Plane } from "lucide-react";

const businessTypes = [
  { 
    icon: Scissors, 
    name: "Haircut & Styling", 
    desc: "Hair salons and styling",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop&crop=face"
  },
  { 
    icon: Sparkles, 
    name: "Nail Care", 
    desc: "Manicure and pedicure",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop"
  },
  { 
    icon: Heart, 
    name: "Massage Therapy", 
    desc: "Spa and wellness treatments",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"
  },
  { 
    icon: Car, 
    name: "Transportation", 
    desc: "Taxi and ride services",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"
  },
  { 
    icon: Users, 
    name: "Group Services", 
    desc: "Shuttle and group bookings",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop"
  },
  { 
    icon: Plane, 
    name: "Travel Services", 
    desc: "Travel and booking assistance",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop"
  }
];

const ModernBusinessTypeCards = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recommended
          </h2>
          <p className="text-lg text-muted-foreground">
            Popular service categories near you
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {businessTypes.map((business, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Icon */}
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <business.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground">
                    Popular
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-1 text-lg">
                  {business.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {business.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ModernBusinessTypeCards;