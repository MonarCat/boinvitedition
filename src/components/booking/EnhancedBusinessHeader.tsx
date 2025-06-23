
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Star, Clock, CheckCircle } from 'lucide-react';

interface EnhancedBusinessHeaderProps {
  business: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    website?: string;
    logo_url?: string;
    featured_image_url?: string;
    average_rating?: number;
    total_reviews?: number;
    is_verified?: boolean;
    business_hours?: any;
  };
}

export const EnhancedBusinessHeader: React.FC<EnhancedBusinessHeaderProps> = ({ business }) => {
  const formatBusinessHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return 'Hours not specified';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const todayHours = hours[today];
    
    if (todayHours && todayHours.open && todayHours.close) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    
    return 'Hours available on request';
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero Section - Mobile Optimized */}
      <Card className="overflow-hidden">
        <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          {business.featured_image_url && (
            <img
              src={business.featured_image_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-4 sm:p-6 text-white w-full">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-white shadow-lg flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-2 mb-1">
                    <span className="truncate">{business.name}</span>
                    {business.is_verified && (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400 flex-shrink-0" />
                    )}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 sm:gap-4 mt-2">
                    {business.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm sm:text-base">
                          {business.average_rating} ({business.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                    {business.is_verified && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                        Verified Business
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Info Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Location Card */}
        {business.address && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Location</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {business.address}
                    {business.city && `, ${business.city}`}
                    {business.country && `, ${business.country}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Card */}
        {business.phone && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Phone</h3>
                  <a 
                    href={`tel:${business.phone}`}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors break-all"
                  >
                    {business.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Hours Card */}
        <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Hours</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {formatBusinessHours(business.business_hours)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      {business.description && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">About {business.name}</h3>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{business.description}</p>
            
            {business.website && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Instructions - Mobile Optimized */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">📋 How to Book</h3>
          <div className="space-y-2 text-blue-800">
            <p className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Choose your preferred service below</span>
            </p>
            <p className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Select date and time that works for you</span>
            </p>
            <p className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Complete your booking with payment</span>
            </p>
            <p className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <span>Receive confirmation and enjoy your service!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
