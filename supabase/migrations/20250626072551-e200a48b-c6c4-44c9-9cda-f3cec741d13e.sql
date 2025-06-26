
-- Allow public users to create clients for booking purposes
CREATE POLICY "Public can create clients for bookings"
  ON public.clients
  FOR INSERT
  WITH CHECK (true);

-- Allow public users to view clients by their contact info (for booking lookups)
CREATE POLICY "Public can view clients by contact info"
  ON public.clients
  FOR SELECT
  USING (
    email IS NOT NULL OR phone IS NOT NULL
  );
