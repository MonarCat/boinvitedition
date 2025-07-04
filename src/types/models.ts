// Define the type for a Service
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category?: string;
  image_url?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Define the type for a Staff member
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  image_url?: string;
  bio?: string;
  services?: string[]; // Array of service IDs this staff can perform
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Define the type for a Booking
export interface Booking {
  id: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  staff_id?: string | null;
  staff_name?: string | null;
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  notes?: string | null;
  amount: number;
  status: string; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status?: string | null; // 'unpaid' | 'paid' | 'refunded'
  business_id: string;
  created_at: string;
  updated_at?: string | null;
}

// Client data for creating a booking
export interface ClientData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

// Define the type for business hours
export interface BusinessHours {
  day: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
}

// Define the type for a Business
export interface Business {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  business_hours?: BusinessHours[];
  user_id: string;
  created_at: string;
  updated_at?: string;
}

// Define the type for a Review
export interface Review {
  id: string;
  booking_id: string;
  client_name: string;
  rating: number;
  comment?: string;
  business_id: string;
  created_at: string;
}

// Define type for dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalBookings: number;
  todayBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  topServices: Array<{
    service_name: string;
    count: number;
    revenue: number;
  }>;
  clientGrowth: Array<{
    date: string;
    count: number;
  }>;
}
