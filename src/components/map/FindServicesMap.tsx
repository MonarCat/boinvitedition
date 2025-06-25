
import React, { useState } from 'react';
import { GoogleMap } from './GoogleMap';
import { FindServicesSearchBar } from './FindServicesSearchBar';
import { BusinessList } from './BusinessList';
import { useAllBusinessesData } from '@/hooks/useAllBusinessesData';
import { toast } from 'sonner';

export const FindServicesMap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  
  const { businesses, isLoading, userLocation } = useAllBusinessesData(searchQuery);

  // Filter businesses by selected categories
  const filteredBusinesses = selectedCategories.length > 0
    ? businesses.filter(business => 
        business.service_categories?.some(category => 
          selectedCategories.includes(category)
        ) || false
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
        <FindServicesSearchBar
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
