
-- Enable RLS on clients table if not already enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients for their business" ON public.clients;

-- Create policy for SELECT operations
CREATE POLICY "Users can view clients for their business"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = clients.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create policy for INSERT operations
CREATE POLICY "Users can insert clients for their business"
  ON public.clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = clients.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create policy for UPDATE operations
CREATE POLICY "Users can update clients for their business"
  ON public.clients
  FOR UPDATE
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

-- Create policy for DELETE operations
CREATE POLICY "Users can delete clients for their business"
  ON public.clients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = clients.business_id
      AND businesses.user_id = auth.uid()
    )
  );
