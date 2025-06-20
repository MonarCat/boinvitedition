
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  average_rating?: number;
  total_reviews?: number;
}

interface BusinessHeaderProps {
  business: Business;
}

export const BusinessHeader = ({ business }: BusinessHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          {/* Business Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-white font-bold text-xl sm:text-2xl">
                {business.name.charAt(0)}
              </span>
            )}
          </div>
          
          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {business.name}
                </h1>
                {business.description && (
                  <p className="text-gray-600 text-base sm:text-lg mb-3 leading-relaxed">
                    {business.description}
                  </p>
                )}
                
                {/* Rating */}
                {business.average_rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(business.average_rating!) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {business.average_rating}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({business.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
              
              {/* Status Badge */}
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 self-start">
                {business.is_active ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          {business.address && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">
                {business.address}
                {business.city && `, ${business.city}`}
                {business.country && `, ${business.country}`}
              </span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a href={`tel:${business.phone}`} className="hover:text-blue-600 transition-colors">
                {business.phone}
              </a>
            </div>
          )}
          {business.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <a href={`mailto:${business.email}`} className="hover:text-blue-600 transition-colors break-all">
                {business.email}
              </a>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <a 
                href={business.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
