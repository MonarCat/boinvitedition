
-- First, let's fix the booking table to support customer information properly
-- Add customer fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Update the Pay As You Go retainer fee to 7% (93% for customer)
UPDATE public.subscriptions 
SET split_percentage = 7.0 
WHERE plan_type = 'payasyougo';

-- Add subdomain support to businesses table if not exists
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE;

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS idx_businesses_subdomain ON public.businesses(subdomain);

-- Update business settings to include subdomain configuration
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS subdomain_enabled BOOLEAN DEFAULT true;
