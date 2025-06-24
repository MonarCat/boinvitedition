
import React, { useState } from 'react';
import { GoogleMap } from './GoogleMap';
import { BusinessSearchBar } from './BusinessSearchBar';
import { BusinessList } from './BusinessList';
import { useBusinessMapData } from '@/hooks/useBusinessMapData';
import { toast } from 'sonner';

export const BusinessMap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  
  const { businesses, isLoading, userLocation } = useBusinessMapData(searchQuery);

  // Filter businesses by selected categories
  const filteredBusinesses = selectedCategories.length > 0
    ? businesses.filter(business => 
        business.service_categories.some(category => 
          selectedCategories.includes(category)
        )
      )
    : businesses;

  const handleBusinessSelect = (business: any) => {
    setSelectedBusiness(business);
  };

  const handleBookNow = (businessId: string) => {
    // Navigate to the business booking page
    const business = filteredBusinesses.find(b => b.id === businessId);
    if (business) {
      // Open booking page in new tab
      window.open(`/book/${businessId}`, '_blank');
      toast.success('Opening booking page...');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedBusiness(null); // Clear selection when searching
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Search and Business List */}
      <div className="w-96 flex flex-col border-r">
        <BusinessSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
        <BusinessList
          businesses={filteredBusinesses}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedBusiness={selectedBusiness}
          onBusinessSelect={handleBusinessSelect}
          onBookNow={handleBookNow}
        />
      </div>

      {/* Right side - Map */}
      <div className="flex-1">
        <GoogleMap
          businesses={filteredBusinesses}
          userLocation={userLocation}
          selectedBusiness={selectedBusiness}
          onBusinessSelect={handleBusinessSelect}
          onBookNow={handleBookNow}
        />
      </div>
    </div>
  );
};
