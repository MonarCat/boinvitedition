export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
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
  business_hours?: BusinessHours;
  [key: string]: unknown; // Allow other properties
}
