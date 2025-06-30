
-- Fix RLS policies for critical tables that are missing proper policies

-- Enable RLS on services table if not already enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies for services
DROP POLICY IF EXISTS "Business owners can manage their services" ON public.services;
DROP POLICY IF EXISTS "Public can view active services" ON public.services;

-- Create proper RLS policies for services
CREATE POLICY "Business owners can manage their services"
  ON public.services
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true);

-- Enable RLS on businesses table if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies for businesses
DROP POLICY IF EXISTS "Users can view and manage their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;

-- Create proper RLS policies for businesses
CREATE POLICY "Users can view and manage their own businesses"
  ON public.businesses
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view active businesses"
  ON public.businesses
  FOR SELECT
  USING (is_active = true);

-- Enable RLS on subscriptions table if not already enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies for subscriptions
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;

-- Create proper RLS policies for subscriptions
CREATE POLICY "Users can manage their own subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable RLS on business_settings table if not already enabled
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies for business_settings
DROP POLICY IF EXISTS "Business owners can manage their settings" ON public.business_settings;

-- Create proper RLS policies for business_settings
CREATE POLICY "Business owners can manage their settings"
  ON public.business_settings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Add missing commission_rate column to subscriptions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'subscriptions' 
                  AND column_name = 'commission_rate') THEN
        ALTER TABLE public.subscriptions ADD COLUMN commission_rate NUMERIC DEFAULT NULL;
    END IF;
END $$;

-- Fix any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON public.business_settings(business_id);
