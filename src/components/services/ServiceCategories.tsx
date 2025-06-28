
import React from 'react';

export const SERVICE_CATEGORIES = [
  // Transport Services
  { value: 'taxi', label: 'Taxi', icon: '🚕' },
  { value: 'shuttle', label: 'Shuttle/Matatu', icon: '🚌' },
  
  // Beauty & Wellness
  { value: 'beauty-wellness', label: 'Beauty and Wellness', icon: '✨' },
  { value: 'salons', label: 'Salons', icon: '💇‍♀️' },
  { value: 'spa', label: 'Spa', icon: '🧘‍♀️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
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
  'taxi': [
    { 
      name: 'City Ride', 
      description: 'Local transportation within city', 
      duration: 30, 
      price: 500,
      transport_details: {
        route: { from: 'CBD', to: 'Westlands' },
        passengers: { adult: 1, child: 0, infant: 0 },
        luggage: 1,
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
      description: 'Airport pickup/drop service', 
      duration: 60, 
      price: 1500,
      transport_details: {
        route: { from: 'JKIA', to: 'CBD' },
        passengers: { adult: 2, child: 0, infant: 0 },
        luggage: 2,
        departure_time: '06:00',
        expected_arrival: '07:00',
        vehicle: {
          registration_number: 'KCB 456B',
          body_type: 'SUV',
          driver_name: 'Jane Smith',
          driver_phone: '+254723456789'
        }
      }
    }
  ],
  'shuttle': [
    { 
      name: '14-Seater Shuttle', 
      description: 'Standard matatu service', 
      duration: 45, 
      price: 100,
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
      name: '17-Seater Shuttle', 
      description: 'Medium capacity shuttle', 
      duration: 50, 
      price: 120,
      transport_details: {
        route: { from: 'Nairobi CBD', to: 'Thika' },
        passengers: { adult: 17, child: 0, infant: 0 },
        luggage: 17,
        departure_time: '06:30',
        expected_arrival: '07:20',
        vehicle: {
          registration_number: 'KCD 101D',
          body_type: '17-Seater Matatu',
          driver_name: 'Samuel Kiprotich',
          driver_phone: '+254745678901'
        },
        seat_layout: '17-seater'
      }
    },
    { 
      name: '24-Seater Shuttle', 
      description: 'Large capacity shuttle', 
      duration: 75, 
      price: 150,
      transport_details: {
        route: { from: 'Nairobi CBD', to: 'Nakuru' },
        passengers: { adult: 24, child: 0, infant: 0 },
        luggage: 24,
        departure_time: '05:00',
        expected_arrival: '06:15',
        vehicle: {
          registration_number: 'KCE 202E',
          body_type: '24-Seater Bus',
          driver_name: 'David Mwangi',
          driver_phone: '+254756789012'
        },
        seat_layout: '24-seater'
      }
    }
  ],
  'beauty-wellness': [
    { name: 'Facial Treatment', description: 'Deep cleansing facial', duration: 60, price: 3000 },
    { name: 'Body Massage', description: 'Full body relaxing massage', duration: 90, price: 4500 },
    { name: 'Manicure & Pedicure', description: 'Hand and foot care', duration: 75, price: 2500 }
  ],
  'salons': [
    { name: 'Hair Cut & Style', description: 'Professional hair styling', duration: 60, price: 1500 },
    { name: 'Hair Coloring', description: 'Professional hair coloring', duration: 120, price: 3500 },
    { name: 'Hair Treatment', description: 'Deep conditioning treatment', duration: 45, price: 2000 }
  ],
  'spa': [
    { name: 'Swedish Massage', description: 'Classic relaxation massage', duration: 60, price: 4000 },
    { name: 'Hot Stone Therapy', description: 'Therapeutic hot stone massage', duration: 90, price: 5500 },
    { name: 'Aromatherapy Session', description: 'Essential oils therapy', duration: 75, price: 4500 }
  ],
  'barbershop': [
    { name: 'Classic Haircut', description: 'Traditional men\'s haircut', duration: 30, price: 500 },
    { name: 'Beard Trim', description: 'Professional beard grooming', duration: 20, price: 300 },
    { name: 'Hair & Beard Combo', description: 'Complete grooming service', duration: 45, price: 700 }
  ]
};
