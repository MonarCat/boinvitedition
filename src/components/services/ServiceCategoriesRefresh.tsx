import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scissors, 
  Car, 
  Wrench, 
  Stethoscope, 
  GraduationCap, 
  Utensils, 
  Camera, 
  Dumbbell, 
  Palette, 
  Music, 
  Home, 
  ShoppingBag,
  Users,
  Calendar,
  Star,
  MapPin
} from 'lucide-react';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  services: string[];
  trending: boolean;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    description: 'Hair, nails, spa, and beauty treatments',
    icon: Scissors,
    color: 'royal-red',
    gradient: 'from-royal-red to-royal-red-dark',
    services: ['Hair Styling', 'Manicure & Pedicure', 'Facial Treatments', 'Massage Therapy'],
    trending: true
  },
  {
    id: 'transport',
    name: 'Transport & Travel',
    description: 'Car rentals, taxi services, and travel bookings',
    icon: Car,
    color: 'royal-blue',
    gradient: 'from-royal-blue to-royal-blue-dark',
    services: ['Taxi Services', 'Car Rentals', 'Airport Transfers', 'Bus Tickets'],
    trending: true
  },
  {
    id: 'automotive',
    name: 'Automotive Services',
    description: 'Car repairs, maintenance, and detailing',
    icon: Wrench,
    color: 'royal-blue',
    gradient: 'from-royal-blue-light to-royal-blue',
    services: ['Car Repairs', 'Oil Changes', 'Car Wash', 'Tire Services'],
    trending: false
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Doctor appointments, dental, and medical services',
    icon: Stethoscope,
    color: 'royal-red',
    gradient: 'from-royal-red-light to-royal-red',
    services: ['Doctor Consultations', 'Dental Appointments', 'Lab Tests', 'Physiotherapy'],
    trending: true
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Tutoring, courses, and skill development',
    icon: GraduationCap,
    color: 'royal-blue',
    gradient: 'from-royal-blue to-royal-blue-light',
    services: ['Private Tutoring', 'Language Classes', 'Skill Workshops', 'Online Courses'],
    trending: false
  },
  {
    id: 'food',
    name: 'Food & Dining',
    description: 'Restaurant reservations and catering services',
    icon: Utensils,
    color: 'royal-red',
    gradient: 'from-royal-red to-royal-red-light',
    services: ['Restaurant Bookings', 'Catering Services', 'Private Chef', 'Food Delivery'],
    trending: true
  },
  {
    id: 'photography',
    name: 'Photography & Events',
    description: 'Professional photography and event planning',
    icon: Camera,
    color: 'royal-blue',
    gradient: 'from-royal-blue-dark to-royal-blue',
    services: ['Wedding Photography', 'Event Planning', 'Portrait Sessions', 'Video Production'],
    trending: false
  },
  {
    id: 'fitness',
    name: 'Fitness & Sports',
    description: 'Gym sessions, personal training, and sports',
    icon: Dumbbell,
    color: 'royal-red',
    gradient: 'from-royal-red-dark to-royal-red',
    services: ['Personal Training', 'Gym Memberships', 'Sports Coaching', 'Yoga Classes'],
    trending: true
  },
  {
    id: 'creative',
    name: 'Creative Services',
    description: 'Art, design, and creative workshops',
    icon: Palette,
    color: 'royal-blue',
    gradient: 'from-royal-blue-light to-royal-blue-dark',
    services: ['Graphic Design', 'Art Classes', 'Craft Workshops', 'Interior Design'],
    trending: false
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Music',
    description: 'Music lessons, entertainment, and performances',
    icon: Music,
    color: 'royal-red',
    gradient: 'from-royal-red-light to-royal-red-dark',
    services: ['Music Lessons', 'DJ Services', 'Live Performances', 'Event Entertainment'],
    trending: false
  },
  {
    id: 'home',
    name: 'Home Services',
    description: 'Cleaning, repairs, and home maintenance',
    icon: Home,
    color: 'royal-blue',
    gradient: 'from-royal-blue to-royal-blue-light',
    services: ['House Cleaning', 'Plumbing', 'Electrical Work', 'Garden Maintenance'],
    trending: true
  },
  {
    id: 'retail',
    name: 'Retail & Shopping',
    description: 'Personal shopping and retail appointments',
    icon: ShoppingBag,
    color: 'royal-red',
    gradient: 'from-royal-red to-royal-red-light',
    services: ['Personal Shopping', 'Fashion Consultation', 'Product Demonstrations', 'Store Appointments'],
    trending: false
  }
];

export const ServiceCategoriesRefresh: React.FC = () => {
  const handleCategorySelect = (category: ServiceCategory) => {
    console.log('Selected category:', category.name);
    // Handle category selection logic here
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-royal-blue mb-4">
          Service Categories
        </h1>
        <p className="text-royal-blue/80 text-lg font-medium max-w-2xl mx-auto">
          Discover and book services across all categories. Choose from our comprehensive selection of professional services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {serviceCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card 
              key={category.id} 
              className="service-card group cursor-pointer relative overflow-hidden border-2 hover:border-royal-blue/30 bg-white/95 backdrop-blur-sm shadow-xl"
              onClick={() => handleCategorySelect(category)}
            >
              {category.trending && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-royal-blue to-royal-red text-white border-0 shadow-lg font-bold">
                    <Star className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-royal-blue text-center group-hover:text-royal-blue-dark transition-colors">
                  {category.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-royal-blue/80 text-sm text-center mb-4 font-semibold">
                  {category.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {category.services.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex items-center text-sm text-royal-blue/70 font-medium">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient} mr-2`}></div>
                      {service}
                    </div>
                  ))}
                  {category.services.length > 3 && (
                    <div className="text-xs text-royal-blue/60 font-bold">
                      +{category.services.length - 3} more services
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${category.gradient} text-white hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 font-bold`}
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-br from-cream-light to-cream border-2 border-royal-blue/20 max-w-2xl mx-auto shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-blue to-royal-red rounded-full flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-royal-blue mb-2">Can't Find Your Service?</h3>
            <p className="text-royal-blue/80 mb-6 font-medium">
              Don't worry! We're constantly adding new service categories and providers. 
              Let us know what you're looking for and we'll help you find the perfect match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-royal-blue to-royal-blue-dark text-white shadow-lg hover:shadow-xl font-bold">
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearby Services
              </Button>
              <Button variant="outline" className="border-2 border-royal-red text-royal-red hover:bg-royal-red hover:text-white font-bold">
                Request New Category
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
