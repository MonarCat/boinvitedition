-- Schema for Boinvit booking system
-- This migration creates or updates tables for businesses, services, staff, and bookings

-- BUSINESSES Table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  logo_url TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'UTC',
  opening_hours JSONB,
  business_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- SERVICES Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- STAFF Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  services JSONB, -- Array of service IDs this staff can perform
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- BOOKINGS Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id),
  service_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  staff_id UUID REFERENCES staff(id),
  staff_name TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  notes TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- PAYMENTS Table (for handling payment transactions related to bookings)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id TEXT,
  payment_details JSONB,
  business_id UUID NOT NULL REFERENCES businesses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- REVIEWS Table (for storing client reviews of services)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Business access policies
CREATE POLICY business_owner_access ON businesses
  FOR ALL USING (auth.uid() = user_id);

-- Service access policies
CREATE POLICY service_owner_access ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = services.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Staff access policies
CREATE POLICY staff_owner_access ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = staff.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Booking access policies
CREATE POLICY booking_owner_access ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Payment access policies
CREATE POLICY payment_owner_access ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = payments.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Review access policies
CREATE POLICY review_owner_access ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = reviews.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add realtime subscriptions
BEGIN;
  -- Add the tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
  ALTER PUBLICATION supabase_realtime ADD TABLE services;
  ALTER PUBLICATION supabase_realtime ADD TABLE staff;
  ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  ALTER PUBLICATION supabase_realtime ADD TABLE payments;
COMMIT;
