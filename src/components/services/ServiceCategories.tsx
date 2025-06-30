
import React from 'react';

export const SERVICE_CATEGORIES = [
  // Main Categories
  { value: 'beauty-wellness', label: 'Beauty & Wellness', icon: '✨' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'events', label: 'Events', icon: '🎉' },
  { value: 'salon', label: 'Salon', icon: '💇‍♀️' },
  { value: 'matatu-shuttle', label: 'Matatu Shuttle', icon: '🚌' },
  { value: 'taxi', label: 'Taxi', icon: '🚕' },
  { value: 'class', label: 'Class', icon: '📚' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  
  // Legacy categories for backward compatibility
  { value: 'general', label: 'General Services', icon: '🔧' },
  { value: 'transport', label: 'Transport & Travel', icon: '🚗' },
  { value: 'food', label: 'Food & Beverage', icon: '🍽️' },
  { value: 'health', label: 'Health & Medical', icon: '🏥' },
  { value: 'education', label: 'Education & Training', icon: '🎓' },
  { value: 'professional', label: 'Professional Services', icon: '💼' },
  { value: 'home', label: 'Home & Garden', icon: '🏠' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'other', label: 'Other Services', icon: '📋' },
];

export const getCategoryIcon = (category: string) => {
  const categoryData = SERVICE_CATEGORIES.find(cat => cat.value === category);
  return categoryData?.icon || '🔧';
};

export const getCategoryLabel = (category: string) => {
  const categoryData = SERVICE_CATEGORIES.find(cat => cat.value === category);
  return categoryData?.label || category;
};

// Industry-specific service templates with distinct offerings
export const SERVICE_TEMPLATES = {
  'beauty-wellness': [
    { name: 'Facial Treatment', description: 'Deep cleansing and rejuvenating facial', duration: 60, price: 3500 },
    { name: 'Full Body Massage', description: 'Relaxing Swedish massage therapy', duration: 90, price: 5000 },
    { name: 'Manicure & Pedicure', description: 'Complete nail care and styling', duration: 75, price: 2800 },
    { name: 'Body Scrub & Wrap', description: 'Exfoliating body treatment', duration: 120, price: 6000 },
    { name: 'Aromatherapy Session', description: 'Essential oils relaxation therapy', duration: 60, price: 4000 },
  ],
  
  'barbershop': [
    { name: 'Classic Haircut', description: 'Traditional men\'s haircut and styling', duration: 30, price: 800 },
    { name: 'Beard Trim & Shape', description: 'Professional beard grooming', duration: 20, price: 500 },
    { name: 'Hot Towel Shave', description: 'Traditional wet shave experience', duration: 45, price: 1200 },
    { name: 'Hair Wash & Style', description: 'Shampoo, cut and styling', duration: 40, price: 1000 },
    { name: 'Full Grooming Package', description: 'Complete hair and beard service', duration: 60, price: 1800 },
  ],
  
  'events': [
    { name: 'Wedding Planning', description: 'Complete wedding coordination', duration: 480, price: 150000 },
    { name: 'Corporate Event', description: 'Business event management', duration: 360, price: 80000 },
    { name: 'Birthday Party Setup', description: 'Party planning and decoration', duration: 240, price: 25000 },
    { name: 'Conference Organization', description: 'Professional conference setup', duration: 480, price: 120000 },
    { name: 'Product Launch Event', description: 'Brand launch event management', duration: 300, price: 90000 },
  ],
  
  'salon': [
    { name: 'Hair Cut & Blow Dry', description: 'Professional styling service', duration: 60, price: 2000 },
    { name: 'Hair Coloring', description: 'Professional hair dyeing service', duration: 120, price: 4500 },
    { name: 'Hair Relaxing', description: 'Chemical hair straightening', duration: 150, price: 3500 },
    { name: 'Bridal Hair & Makeup', description: 'Complete bridal styling', duration: 180, price: 8000 },
    { name: 'Hair Treatment', description: 'Deep conditioning therapy', duration: 90, price: 3000 },
  ],
  
  'matatu-shuttle': [
    { 
      name: '14-Seater Route Service', 
      description: 'Standard matatu route transport', 
      duration: 45, 
      price: 150,
      transport_details: {
        route: { from: 'Nairobi CBD', to: 'Kasarani' },
        passengers: { adult: 14, child: 0, infant: 0 },
        luggage: 14,
        departure_time: '07:00',
        expected_arrival: '07:45',
        vehicle: {
          registration_number: 'KCC 789C',
          body_type: '14-Seater Matatu',
          driver_name: 'Peter Kamau',
          driver_phone: '+254734567890'
        },
        seat_layout: '14-seater'
      }
    },
    { 
      name: '25-Seater Long Distance', 
      description: 'Inter-county shuttle service', 
      duration: 180, 
      price: 800,
      transport_details: {
        route: { from: 'Nairobi', to: 'Mombasa' },
        passengers: { adult: 25, child: 0, infant: 0 },
        luggage: 25,
        departure_time: '05:00',
        expected_arrival: '08:00',
        vehicle: {
          registration_number: 'KCE 202E',
          body_type: '25-Seater Bus',
          driver_name: 'David Mwangi',
          driver_phone: '+254756789012'
        },
        seat_layout: '25-seater'
      }
    },
    { 
      name: 'Airport Shuttle', 
      description: 'Dedicated airport transfer service', 
      duration: 60, 
      price: 300,
      transport_details: {
        route: { from: 'CBD', to: 'JKIA' },
        passengers: { adult: 12, child: 0, infant: 0 },
        luggage: 15,
        departure_time: '04:00',
        expected_arrival: '05:00',
        vehicle: {
          registration_number: 'KCF 303F',
          body_type: '12-Seater Van',
          driver_name: 'Samuel Kiprotich',
          driver_phone: '+254767890123'
        },
        seat_layout: '12-seater'
      }
    }
  ],
  
  'taxi': [
    { 
      name: 'City Ride', 
      description: 'Local city transportation', 
      duration: 30, 
      price: 600,
      transport_details: {
        route: { from: 'CBD', to: 'Westlands' },
        passengers: { adult: 4, child: 0, infant: 0 },
        luggage: 2,
        departure_time: '08:00',
        expected_arrival: '08:30',
        vehicle: {
          registration_number: 'KCA 123A',
          body_type: 'Sedan',
          driver_name: 'John Doe',
          driver_phone: '+254712345678'
        }
      }
    },
    { 
      name: 'Airport Transfer', 
      description: 'Premium airport pickup/drop', 
      duration: 60, 
      price: 2000,
      transport_details: {
        route: { from: 'JKIA', to: 'CBD Hotels' },
        passengers: { adult: 3, child: 0, infant: 0 },
        luggage: 4,
        departure_time: '06:00',
        expected_arrival: '07:00',
        vehicle: {
          registration_number: 'KCB 456B',
          body_type: 'SUV',
          driver_name: 'Jane Smith',
          driver_phone: '+254723456789'
        }
      }
    },
    { 
      name: 'Executive Ride', 
      description: 'Premium luxury transport', 
      duration: 45, 
      price: 1500,
      transport_details: {
        route: { from: 'Hotel', to: 'Business District' },
        passengers: { adult: 2, child: 0, infant: 0 },
        luggage: 1,
        departure_time: '09:00',
        expected_arrival: '09:45',
        vehicle: {
          registration_number: 'KCD 789D',
          body_type: 'Executive Sedan',
          driver_name: 'Michael Ochieng',
          driver_phone: '+254745678901'
        }
      }
    }
  ],
  
  'class': [
    { name: 'Private Tutoring', description: 'One-on-one academic support', duration: 60, price: 2000 },
    { name: 'Group Study Session', description: 'Small group learning', duration: 90, price: 1200 },
    { name: 'Exam Preparation', description: 'Intensive exam coaching', duration: 120, price: 3000 },
    { name: 'Language Lesson', description: 'Foreign language instruction', duration: 60, price: 1800 },
    { name: 'Music Lesson', description: 'Instrument or vocal training', duration: 45, price: 2500 },
    { name: 'Art & Craft Class', description: 'Creative skills workshop', duration: 90, price: 2200 },
  ],
  
  'hospitality': [
    { name: 'Room Service', description: 'In-room dining and service', duration: 30, price: 1500 },
    { name: 'Concierge Service', description: 'Personal assistance and bookings', duration: 60, price: 2500 },
    { name: 'Laundry & Pressing', description: 'Garment cleaning service', duration: 240, price: 800 },
    { name: 'Airport Pickup', description: 'Guest transportation service', duration: 60, price: 3000 },
    { name: 'Tour Guide Service', description: 'Local sightseeing assistance', duration: 480, price: 8000 },
    { name: 'Event Catering', description: 'Hotel event food service', duration: 300, price: 25000 },
  ],

  // Legacy templates for backward compatibility
  'general': [
    { name: 'Consultation', description: 'Professional consultation service', duration: 60, price: 2500 },
    { name: 'Basic Service', description: 'Standard service offering', duration: 45, price: 1800 },
  ],
  
  'transport': [
    { name: 'Local Transport', description: 'City transportation service', duration: 30, price: 500 },
    { name: 'Long Distance', description: 'Inter-city travel service', duration: 120, price: 2000 },
  ],
  
  'food': [
    { name: 'Catering Service', description: 'Event catering service', duration: 240, price: 18000 },
    { name: 'Private Chef', description: 'Personal cooking service', duration: 180, price: 10000 }
  ],
  
  'health': [
    { name: 'Health Checkup', description: 'Comprehensive health screening', duration: 60, price: 6000 },
    { name: 'Physiotherapy', description: 'Physical therapy session', duration: 45, price: 3500 }
  ],
  
  'other': [
    { name: 'Custom Service', description: 'Tailored service offering', duration: 60, price: 2500 }
  ]
};
