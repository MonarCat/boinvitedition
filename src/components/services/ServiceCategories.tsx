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
  { value: 'wellness', label: 'Wellness Center', icon: '🧘' },
  
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
  { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
  { value: 'dance', label: 'Dance Studio', icon: '💃' },
  
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
  { value: 'matatu', label: 'Matatu Services', icon: '🚐' },
  { value: 'shuttle', label: 'Shuttle Services', icon: '🚌' },
  { value: 'bus', label: 'Bus Services', icon: '🚌' },
  { value: 'train', label: 'Train Services', icon: '🚆' },
  { value: 'ride-sharing', label: 'Ride Sharing', icon: '🚗' },
  { value: 'courier', label: 'Courier & Delivery', icon: '📦' },
  { value: 'car-rental', label: 'Car Rental', icon: '🚙' },
  { value: 'airport-shuttle', label: 'Airport Shuttle', icon: '✈️' },
  { value: 'boat-ferry', label: 'Boat & Ferry', icon: '⛴️' },
  { value: 'motorcycle-taxi', label: 'Motorcycle Taxi (Boda Boda)', icon: '🏍️' },
  { value: 'truck-transport', label: 'Truck Transport', icon: '🚛' },
  
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

// Enhanced service templates for different industries
export const SERVICE_TEMPLATES = {
  // Transport Services
  'taxi': [
    { name: 'City Ride', description: 'Within city transportation', duration: 30, price: 500 },
    { name: 'Airport Transfer', description: 'Airport pickup/drop-off', duration: 60, price: 1200 },
    { name: 'Hourly Hire', description: 'Vehicle rental per hour', duration: 60, price: 800 },
    { name: 'Long Distance', description: 'Inter-city travel', duration: 240, price: 3000 },
    { name: 'Night Ride', description: 'Late night transportation', duration: 30, price: 700 }
  ],
  'matatu': [
    { name: 'Nairobi-Nakuru', description: 'Daily route service', duration: 180, price: 350 },
    { name: 'Nairobi-Mombasa', description: 'Long distance travel', duration: 600, price: 1200 },
    { name: 'City Route', description: 'Urban commuter service', duration: 45, price: 50 },
    { name: 'Express Service', description: 'Non-stop premium route', duration: 150, price: 500 },
    { name: 'Night Travel', description: 'Overnight journey', duration: 480, price: 800 }
  ],
  'shuttle': [
    { name: 'Airport Shuttle', description: '14-seater airport transfer', duration: 90, price: 300 },
    { name: 'Hotel Shuttle', description: 'Hotel pickup/drop service', duration: 45, price: 200 },
    { name: 'Event Shuttle', description: 'Group event transportation', duration: 120, price: 1500 },
    { name: 'School Run', description: 'Student transportation', duration: 60, price: 150 },
    { name: 'Corporate Shuttle', description: 'Office transportation', duration: 90, price: 400 }
  ],
  
  // Beauty & Wellness
  'hair-salon': [
    { name: 'Hair Cut & Style', description: 'Professional cut and styling', duration: 60, price: 1500 },
    { name: 'Hair Wash & Blow Dry', description: 'Cleansing and styling', duration: 45, price: 800 },
    { name: 'Hair Coloring', description: 'Professional hair coloring', duration: 120, price: 3500 },
    { name: 'Hair Treatment', description: 'Deep conditioning treatment', duration: 90, price: 2000 },
    { name: 'Bridal Hair Styling', description: 'Special occasion styling', duration: 150, price: 5000 },
    { name: 'Hair Extensions', description: 'Hair extension installation', duration: 180, price: 4000 },
    { name: 'Perm Service', description: 'Hair perming treatment', duration: 120, price: 2500 }
  ],
  'barber': [
    { name: 'Classic Haircut', description: 'Traditional mens haircut', duration: 30, price: 500 },
    { name: 'Beard Trim', description: 'Professional beard grooming', duration: 20, price: 300 },
    { name: 'Hot Towel Shave', description: 'Traditional wet shave', duration: 45, price: 800 },
    { name: 'Hair & Beard Combo', description: 'Complete grooming package', duration: 60, price: 1000 },
    { name: 'Fade Cut', description: 'Modern fade haircut', duration: 45, price: 700 },
    { name: 'Mustache Trim', description: 'Precision mustache grooming', duration: 15, price: 200 },
    { name: 'Head Shave', description: 'Complete head shaving', duration: 30, price: 400 }
  ],
  'beauty-spa': [
    { name: 'Facial Treatment', description: 'Deep cleansing facial', duration: 60, price: 2500 },
    { name: 'Full Body Massage', description: 'Relaxing massage therapy', duration: 90, price: 3500 },
    { name: 'Manicure & Pedicure', description: 'Complete nail care', duration: 90, price: 1800 },
    { name: 'Body Scrub', description: 'Exfoliating body treatment', duration: 75, price: 2800 },
    { name: 'Eyebrow Threading', description: 'Precision eyebrow shaping', duration: 30, price: 600 },
    { name: 'Waxing Service', description: 'Professional hair removal', duration: 45, price: 1500 },
    { name: 'Anti-Aging Treatment', description: 'Skin rejuvenation therapy', duration: 120, price: 4500 }
  ],
  'wellness': [
    { name: 'Aromatherapy Massage', description: 'Essential oil massage', duration: 90, price: 3000 },
    { name: 'Reflexology', description: 'Foot pressure point therapy', duration: 60, price: 2000 },
    { name: 'Acupuncture Session', description: 'Traditional acupuncture', duration: 75, price: 2500 },
    { name: 'Meditation Class', description: 'Guided meditation session', duration: 45, price: 800 },
    { name: 'Wellness Consultation', description: 'Health and wellness assessment', duration: 60, price: 1500 },
    { name: 'Detox Treatment', description: 'Body detoxification therapy', duration: 120, price: 4000 }
  ],
  
  // Fitness & Gym
  'gym': [
    { name: 'Day Pass', description: 'Single day gym access', duration: 240, price: 500 },
    { name: 'Personal Training', description: '1-on-1 fitness session', duration: 60, price: 2000 },
    { name: 'Group Fitness Class', description: 'Instructor-led group workout', duration: 45, price: 800 },
    { name: 'Swimming Pool Access', description: 'Pool facilities usage', duration: 120, price: 600 },
    { name: 'Sauna & Steam Room', description: 'Relaxation facilities', duration: 30, price: 400 },
    { name: 'Fitness Assessment', description: 'Body composition analysis', duration: 45, price: 1200 },
    { name: 'Nutrition Consultation', description: 'Diet planning session', duration: 60, price: 1500 }
  ],
  'personal-training': [
    { name: 'Strength Training', description: 'Weight lifting session', duration: 60, price: 2500 },
    { name: 'Cardio Workout', description: 'Cardiovascular training', duration: 45, price: 2000 },
    { name: 'HIIT Training', description: 'High-intensity interval training', duration: 30, price: 1800 },
    { name: 'Functional Training', description: 'Movement-based exercises', duration: 60, price: 2200 },
    { name: 'Sports-Specific Training', description: 'Sport-focused conditioning', duration: 75, price: 2800 },
    { name: 'Rehabilitation Training', description: 'Injury recovery exercises', duration: 60, price: 3000 }
  ],
  'yoga': [
    { name: 'Hatha Yoga Class', description: 'Gentle yoga practice', duration: 60, price: 1000 },
    { name: 'Vinyasa Flow', description: 'Dynamic yoga sequences', duration: 75, price: 1200 },
    { name: 'Hot Yoga Session', description: 'Heated room yoga practice', duration: 90, price: 1500 },
    { name: 'Private Yoga Lesson', description: '1-on-1 yoga instruction', duration: 60, price: 2500 },
    { name: 'Meditation & Mindfulness', description: 'Guided meditation session', duration: 45, price: 800 },
    { name: 'Prenatal Yoga', description: 'Pregnancy-safe yoga practice', duration: 60, price: 1300 }
  ],
  'crossfit': [
    { name: 'WOD (Workout of the Day)', description: 'Daily CrossFit workout', duration: 60, price: 1500 },
    { name: 'Olympic Lifting', description: 'Weightlifting technique class', duration: 90, price: 2000 },
    { name: 'Beginner Fundamentals', description: 'CrossFit basics training', duration: 75, price: 1800 },
    { name: 'Competition Prep', description: 'Advanced training for competitions', duration: 120, price: 3000 },
    { name: 'Open Gym Access', description: 'Self-directed training time', duration: 120, price: 800 }
  ],
  
  // Existing templates (keeping the good ones)
  'hotel': [
    { name: 'Standard Room', description: 'Comfortable accommodation', duration: 1440, price: 5000 },
    { name: 'Deluxe Suite', description: 'Luxury suite with amenities', duration: 1440, price: 12000 },
    { name: 'Conference Room', description: 'Meeting room rental', duration: 480, price: 8000 },
    { name: 'Spa Services', description: 'Hotel spa treatments', duration: 90, price: 4000 },
    { name: 'Airport Pickup', description: 'Transportation service', duration: 60, price: 1500 }
  ],
  'airbnb': [
    { name: 'Entire Apartment', description: 'Whole apartment rental', duration: 1440, price: 4000 },
    { name: 'Private Room', description: 'Single room in shared space', duration: 1440, price: 2500 },
    { name: 'Shared Room', description: 'Bed in shared accommodation', duration: 1440, price: 1200 },
    { name: 'Cleaning Service', description: 'Professional cleaning', duration: 120, price: 2000 },
    { name: 'Check-in Assistance', description: 'Guided check-in support', duration: 30, price: 500 }
  ]
};
