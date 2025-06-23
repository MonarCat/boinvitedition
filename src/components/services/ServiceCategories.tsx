import React from 'react';

export const SERVICE_CATEGORIES = [
  // Beauty & Personal Care
  { value: 'hair-salon', label: 'Hair Salon', icon: '✂️' },
  { value: 'barber', label: 'Barber Shop', icon: '💈' },
  { value: 'nail-salon', label: 'Nail Salon', icon: '💅' },
  { value: 'beauty-spa', label: 'Beauty & Spa', icon: '💆‍♀️' },
  { value: 'massage', label: 'Massage Therapy', icon: '🤲' },
  { value: 'skincare', label: 'Skincare Clinic', icon: '✨' },
  { value: 'tattoo-piercing', label: 'Tattoo & Piercing', icon: '🎨' },
  { value: 'makeup', label: 'Makeup Artist', icon: '💄' },
  
  // Health & Medical
  { value: 'medical', label: 'Medical Services', icon: '🏥' },
  { value: 'dental', label: 'Dental Care', icon: '🦷' },
  { value: 'physiotherapy', label: 'Physiotherapy', icon: '🏃‍♂️' },
  { value: 'mental-health', label: 'Mental Health', icon: '🧠' },
  { value: 'veterinary', label: 'Veterinary Care', icon: '🐕' },
  { value: 'optometry', label: 'Eye Care', icon: '👁️' },
  { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { value: 'laboratory', label: 'Medical Laboratory', icon: '🔬' },
  
  // Fitness & Wellness
  { value: 'gym', label: 'Gym & Fitness', icon: '💪' },
  { value: 'yoga', label: 'Yoga Studio', icon: '🧘‍♀️' },
  { value: 'personal-training', label: 'Personal Training', icon: '🏋️‍♂️' },
  { value: 'nutrition', label: 'Nutrition Counseling', icon: '🥗' },
  { value: 'pilates', label: 'Pilates', icon: '🤸‍♀️' },
  { value: 'martial-arts', label: 'Martial Arts', icon: '🥋' },
  { value: 'swimming', label: 'Swimming Pool', icon: '🏊‍♂️' },
  
  // Professional Services
  { value: 'consulting', label: 'Business Consulting', icon: '💼' },
  { value: 'legal', label: 'Legal Services', icon: '⚖️' },
  { value: 'accounting', label: 'Accounting', icon: '📊' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'tutoring', label: 'Tutoring & Education', icon: '📚' },
  { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { value: 'insurance', label: 'Insurance Services', icon: '🛡️' },
  { value: 'marketing', label: 'Marketing & PR', icon: '📢' },
  
  // Hospitality & Accommodation
  { value: 'hotel', label: 'Hotel Services', icon: '🏨' },
  { value: 'airbnb', label: 'Vacation Rentals', icon: '🏡' },
  { value: 'restaurant', label: 'Restaurant & Dining', icon: '🍽️' },
  { value: 'event-planning', label: 'Event Planning', icon: '🎉' },
  { value: 'catering', label: 'Catering Services', icon: '🍴' },
  { value: 'conference-rooms', label: 'Conference Rooms', icon: '🏢' },
  { value: 'banquet-halls', label: 'Banquet Halls', icon: '🎊' },
  { value: 'bed-breakfast', label: 'Bed & Breakfast', icon: '🛏️' },
  { value: 'resort', label: 'Resort & Spa', icon: '🏖️' },
  
  // Transport Services
  { value: 'taxi', label: 'Taxi Services', icon: '🚕' },
  { value: 'bus', label: 'Bus Services', icon: '🚌' },
  { value: 'train', label: 'Train Services', icon: '🚆' },
  { value: 'ride-sharing', label: 'Ride Sharing', icon: '🚗' },
  { value: 'courier', label: 'Courier & Delivery', icon: '📦' },
  { value: 'car-rental', label: 'Car Rental', icon: '🚙' },
  { value: 'airport-shuttle', label: 'Airport Shuttle', icon: '✈️' },
  { value: 'boat-ferry', label: 'Boat & Ferry', icon: '⛴️' },
  { value: 'motorcycle-taxi', label: 'Motorcycle Taxi', icon: '🏍️' },
  
  // Home Services
  { value: 'cleaning', label: 'Cleaning Services', icon: '🧹' },
  { value: 'repair', label: 'Repair Services', icon: '🔧' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
  { value: 'electrical', label: 'Electrical Services', icon: '⚡' },
  { value: 'gardening', label: 'Gardening & Landscaping', icon: '🌱' },
  { value: 'painting', label: 'Painting Services', icon: '🎨' },
  { value: 'carpentry', label: 'Carpentry', icon: '🔨' },
  { value: 'moving', label: 'Moving Services', icon: '📦' },
  
  // Events & Entertainment
  { value: 'wedding-planning', label: 'Wedding Planning', icon: '💒' },
  { value: 'dj-music', label: 'DJ & Music', icon: '🎵' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'party-planning', label: 'Party Planning', icon: '🎈' },
  { value: 'venue', label: 'Event Venue', icon: '🏛️' },
  { value: 'decoration', label: 'Event Decoration', icon: '🎀' },
  
  // Automotive
  { value: 'auto-repair', label: 'Auto Repair', icon: '🔧' },
  { value: 'car-wash', label: 'Car Wash', icon: '🚗' },
  { value: 'tire-service', label: 'Tire Service', icon: '🛞' },
  { value: 'auto-parts', label: 'Auto Parts', icon: '⚙️' },
  
  // Technology
  { value: 'it-support', label: 'IT Support', icon: '💻' },
  { value: 'web-design', label: 'Web Design', icon: '🌐' },
  { value: 'software-dev', label: 'Software Development', icon: '👨‍💻' },
  { value: 'phone-repair', label: 'Phone Repair', icon: '📱' },
  
  // Other
  { value: 'other', label: 'Other Services', icon: '🔧' }
];

export const getCategoryIcon = (category: string) => {
  const categoryData = SERVICE_CATEGORIES.find(cat => cat.value === category);
  return categoryData?.icon || '🔧';
};

export const getCategoryLabel = (category: string) => {
  const categoryData = SERVICE_CATEGORIES.find(cat => cat.value === category);
  return categoryData?.label || category;
};

// Service templates for different industries
export const SERVICE_TEMPLATES = {
  'hotel': [
    { name: 'Room Booking', description: 'Standard room reservation', duration: 1440, price: 100 },
    { name: 'Suite Booking', description: 'Luxury suite reservation', duration: 1440, price: 250 },
    { name: 'Conference Room', description: 'Meeting room rental', duration: 480, price: 150 },
    { name: 'Spa Services', description: 'Hotel spa treatments', duration: 90, price: 80 },
    { name: 'Airport Pickup', description: 'Transportation service', duration: 60, price: 30 }
  ],
  'airbnb': [
    { name: 'Entire Place', description: 'Whole apartment/house', duration: 1440, price: 80 },
    { name: 'Private Room', description: 'Single room in shared space', duration: 1440, price: 45 },
    { name: 'Shared Room', description: 'Bed in shared room', duration: 1440, price: 25 },
    { name: 'Cleaning Service', description: 'Professional cleaning', duration: 120, price: 40 },
    { name: 'Check-in Assistance', description: 'Guided check-in', duration: 30, price: 15 }
  ],
  'beauty-spa': [
    { name: 'Facial Treatment', description: 'Deep cleansing facial', duration: 60, price: 50 },
    { name: 'Full Body Massage', description: 'Relaxing massage therapy', duration: 90, price: 70 },
    { name: 'Manicure & Pedicure', description: 'Nail care service', duration: 75, price: 35 },
    { name: 'Hair Styling', description: 'Professional hair styling', duration: 120, price: 60 },
    { name: 'Eyebrow Shaping', description: 'Eyebrow threading/waxing', duration: 30, price: 20 }
  ],
  'gym': [
    { name: 'Day Pass', description: 'Single day gym access', duration: 480, price: 15 },
    { name: 'Personal Training', description: '1-on-1 fitness session', duration: 60, price: 50 },
    { name: 'Group Class', description: 'Fitness group session', duration: 45, price: 20 },
    { name: 'Swimming Pool', description: 'Pool access', duration: 120, price: 10 },
    { name: 'Sauna Session', description: 'Relaxation therapy', duration: 30, price: 25 }
  ],
  'transport': [
    { name: 'City Transfer', description: 'Local transportation', duration: 30, price: 10 },
    { name: 'Airport Transfer', description: 'Airport pickup/drop', duration: 60, price: 25 },
    { name: 'Long Distance', description: 'Inter-city travel', duration: 240, price: 80 },
    { name: 'Hourly Rental', description: 'Vehicle rental per hour', duration: 60, price: 15 },
    { name: 'Tour Package', description: 'Sightseeing tour', duration: 480, price: 120 }
  ]
};
