
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  category?: string;
  is_transport_service?: boolean;
  transport_details?: any;
  [key: string]: unknown; // Allow other properties
}

export interface BusinessHour {
  open: string;
  close: string;
}

export interface BusinessHours {
  [day: string]: BusinessHour;
}

export interface Business {
  id: string;
  name: string;
  business_hours?: BusinessHours | any; // Allow Json type from Supabase
  [key: string]: unknown; // Allow other properties
}
