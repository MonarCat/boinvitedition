
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const GLOBAL_BUSINESSES = [
  { name: 'Global Beauty Spa', category: 'Beauty & Spa', logo: '💅', location: 'New York' },
  { name: 'FitLife Gym', category: 'Fitness', logo: '💪', location: 'London' },
  { name: 'HealthCare Plus', category: 'Healthcare', logo: '🏥', location: 'Toronto' },
  { name: 'Style Cuts Salon', category: 'Hair Salon', logo: '💈', location: 'Sydney' },
  { name: 'Luxury Suites Hotel', category: 'Hospitality', logo: '🏨', location: 'Dubai' },
  { name: 'Swift Transport', category: 'Transport', logo: '🚌', location: 'Berlin' },
  { name: 'Zen Wellness Studio', category: 'Wellness', logo: '🧘‍♀️', location: 'Tokyo' },
  { name: 'TechFix Pro', category: 'Repair Services', logo: '🔧', location: 'Mumbai' },
  { name: 'Smile Dental Care', category: 'Dental', logo: '🦷', location: 'Paris' },
  { name: 'Premium Car Rental', category: 'Car Rental', logo: '🚗', location: 'Los Angeles' }
];

export const GlobalPartnersSlider = () => {
  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of businesses globally using Boinvit to manage their operations
          </p>
        </div>

        <div className="relative">
          <div className="flex animate-scroll space-x-6">
            {GLOBAL_BUSINESSES.map((partner, index) => (
              <Card 
                key={`first-${index}`} 
                className="flex-shrink-0 w-64 hover:shadow-2xl hover:scale-105 hover:border-2 hover:border-blue-500 transition-all duration-300 group cursor-pointer border-2 border-transparent bg-gradient-to-br from-white to-blue-50"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">{partner.logo}</div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">{partner.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{partner.category}</p>
                  <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                    <span className="inline-block group-hover:animate-pulse">📍</span>
                    {partner.location}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {GLOBAL_BUSINESSES.map((partner, index) => (
              <Card 
                key={`second-${index}`} 
                className="flex-shrink-0 w-64 hover:shadow-2xl hover:scale-105 hover:border-2 hover:border-blue-500 transition-all duration-300 group cursor-pointer border-2 border-transparent bg-gradient-to-br from-white to-blue-50"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">{partner.logo}</div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">{partner.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{partner.category}</p>
                  <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                    <span className="inline-block group-hover:animate-pulse">📍</span>
                    {partner.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
