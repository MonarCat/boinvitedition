-- ===========================================
-- FIX 1: Business Data Exposure
-- Create a secure view for public business listings
-- ===========================================

-- Create a public view with only safe fields for public access
CREATE OR REPLACE VIEW public.business_listings AS
SELECT 
  id,
  name,
  description,
  address,
  city,
  country,
  website,
  logo_url,
  featured_image_url,
  average_rating,
  total_reviews,
  business_hours,
  service_radius_km,
  latitude,
  longitude,
  is_verified,
  currency,
  subdomain,
  created_at
FROM public.businesses
WHERE is_active = true;

-- Grant public access only to the safe view
GRANT SELECT ON public.business_listings TO anon, authenticated;

-- Remove the overly permissive public access policies
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Secure_Public_can_view_active_businesses" ON public.businesses;

-- ===========================================
-- FIX 2: Storage Bucket Permissions
-- Restrict file modification to file owners only
-- ===========================================

-- Drop existing overly permissive policies for business-assets bucket
DROP POLICY IF EXISTS "Users can update their own business assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own business assets" ON storage.objects;

-- Create owner-based policies for business-assets bucket
CREATE POLICY "Business owners can update their assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Business owners can delete their assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Drop existing overly permissive policies for service-images bucket
DROP POLICY IF EXISTS "Users can update their own service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own service images" ON storage.objects;

-- Create owner-based policies for service-images bucket
CREATE POLICY "Service owners can update their images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'service-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Service owners can delete their images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'service-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- Drop existing overly permissive policies for staff-avatars bucket
DROP POLICY IF EXISTS "Users can update their own staff avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own staff avatars" ON storage.objects;

-- Create owner-based policies for staff-avatars bucket
CREATE POLICY "Staff owners can update their avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'staff-avatars' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Staff owners can delete their avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'staff-avatars' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE user_id = auth.uid()
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  );