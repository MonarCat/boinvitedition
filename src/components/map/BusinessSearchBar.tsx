
import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface BusinessSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  availableCategories?: string[];
}

export const BusinessSearchBar: React.FC<BusinessSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategories = [],
  onCategoryChange,
  availableCategories = [
    'Beauty & Spa', 'Healthcare', 'Restaurant', 'Fitness', 'Education',
    'Automotive', 'Entertainment', 'Professional Services', 'Retail',
    'Home Services', 'Technology', 'Transport'
  ]
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleCategoryToggle = (category: string) => {
    if (!onCategoryChange) return;
    
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    onCategoryChange(newCategories);
  };

  return (
    <div className="bg-white shadow-md border-b">
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search businesses, services, or locations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span>Discover all businesses on Boinvit</span>
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCategories.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Searching for: <span className="font-medium">"{searchQuery}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
