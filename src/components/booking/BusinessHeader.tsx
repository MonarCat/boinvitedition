
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Phone, Mail, Star } from 'lucide-react';

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
  is_active: boolean;
  average_rating?: number;
  total_reviews?: number;
}

interface BusinessHeaderProps {
  business: Business;
}

export const BusinessHeader = ({ business }: BusinessHeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-white to-blue-50 border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8 shadow-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover" />
            ) : (
              <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 break-words mb-2">{business.name}</h1>
            {business.description && (
              <p className="text-gray-600 mt-2 text-base sm:text-lg leading-relaxed">{business.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
              <Badge 
                variant="outline" 
                className={`px-3 py-1 text-sm font-medium ${
                  business.is_active 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {business.is_active ? '✓ Open for Bookings' : '✗ Currently Closed'}
              </Badge>
              {business.average_rating && (
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-yellow-700">{business.average_rating}</span>
                  <span className="text-sm text-yellow-600">({business.total_reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {business.address && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                <span className="text-gray-600 break-words">{business.address}, {business.city}, {business.country}</span>
              </div>
            </div>
          )}
          {business.phone && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                <a href={`tel:${business.phone}`} className="text-green-600 hover:text-green-700 font-medium">
                  {business.phone}
                </a>
              </div>
            </div>
          )}
          {business.email && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                <a href={`mailto:${business.email}`} className="text-purple-600 hover:text-purple-700 font-medium break-all">
                  {business.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
