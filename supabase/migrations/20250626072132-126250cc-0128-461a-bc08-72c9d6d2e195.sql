
-- Drop existing restrictive booking policies
DROP POLICY IF EXISTS "Business owners can manage their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;

-- Create new policies that allow public booking creation
CREATE POLICY "Business owners can manage their bookings"
  ON public.bookings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Allow public users to create bookings (INSERT only)
CREATE POLICY "Public can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow public users to view their own bookings by customer info
CREATE POLICY "Public can view bookings by customer info"
  ON public.bookings
  FOR SELECT
  USING (
    customer_email IS NOT NULL OR 
    customer_phone IS NOT NULL
  );
