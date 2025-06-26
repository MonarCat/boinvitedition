
-- Drop existing policies safely
DO $$ 
BEGIN
    -- Drop policies for bookings table
    DROP POLICY IF EXISTS "Public users can create bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Business owners can manage their bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Public can view bookings with contact info" ON public.bookings;
    DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
    
    -- Drop policies for clients table  
    DROP POLICY IF EXISTS "Business owners can manage their clients" ON public.clients;
    DROP POLICY IF EXISTS "Public users can create clients for bookings" ON public.clients;
    DROP POLICY IF EXISTS "Public can view clients for booking verification" ON public.clients;
    DROP POLICY IF EXISTS "Public can create clients for bookings" ON public.clients;
    DROP POLICY IF EXISTS "Public can view clients by contact info" ON public.clients;
    DROP POLICY IF EXISTS "Users can view clients for their business" ON public.clients;
    DROP POLICY IF EXISTS "Users can insert clients for their business" ON public.clients;
    DROP POLICY IF EXISTS "Users can update clients for their business" ON public.clients;
    DROP POLICY IF EXISTS "Users can delete clients for their business" ON public.clients;
EXCEPTION 
    WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create fresh policies for bookings
CREATE POLICY "allow_public_booking_creation"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_business_owners_manage_bookings"
  ON public.bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = bookings.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "allow_public_booking_viewing"
  ON public.bookings
  FOR SELECT
  USING (
    customer_email IS NOT NULL OR customer_phone IS NOT NULL
  );

-- Create fresh policies for clients
CREATE POLICY "allow_business_owners_manage_clients"
  ON public.clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = clients.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = clients.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "allow_public_client_creation"
  ON public.clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_public_client_viewing"
  ON public.clients
  FOR SELECT
  USING (true);
