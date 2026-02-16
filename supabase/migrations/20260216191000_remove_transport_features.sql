-- Migration: Remove transport and other non-salon niche features
-- Boinvit is now focused exclusively on Salon/Beauty Parlour/Barbershop management

-- ========================================
-- PART 1: Remove transport-related columns from services table
-- ========================================

-- Drop transport service flag if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'services'
    AND column_name = 'is_transport_service'
  ) THEN
    ALTER TABLE public.services DROP COLUMN is_transport_service;
  END IF;
END $$;

-- Drop transport details column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'services'
    AND column_name = 'transport_details'
  ) THEN
    ALTER TABLE public.services DROP COLUMN transport_details;
  END IF;
END $$;

-- ========================================
-- PART 2: Remove transport service categories
-- ========================================

-- Delete any existing transport services (bus, train, taxi, etc.)
-- This is a data cleanup operation
DELETE FROM public.services
WHERE category IN ('bus', 'train', 'taxi', 'flight', 'ride-sharing', 'courier', 'car-rental', 'ferry', 'metro', 'tram');

-- ========================================
-- PART 3: Update service categories to salon/beauty only
-- ========================================

-- Add constraint to ensure only salon/beauty categories are allowed
-- First, get unique existing categories that are salon-related
DO $$
BEGIN
  -- Add a check constraint for valid service categories (salon/beauty/barbershop only)
  ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_category_check;
  
  ALTER TABLE public.services
  ADD CONSTRAINT services_category_check
  CHECK (category IS NULL OR category IN (
    'haircut',
    'styling',
    'coloring',
    'treatment',
    'manicure',
    'pedicure',
    'facial',
    'massage',
    'makeup',
    'waxing',
    'braiding',
    'extensions',
    'beard_grooming',
    'shaving',
    'spa',
    'nails',
    'hair',
    'beauty',
    'barbershop',
    'salon'
  ));
END $$;

-- ========================================
-- PART 4: Add comments for clarity
-- ========================================

COMMENT ON TABLE public.services IS 'Services offered by salons, beauty parlours, and barbershops only';
COMMENT ON COLUMN public.services.category IS 'Service category - must be salon/beauty/barbershop related';

-- ========================================
-- PART 5: Update business descriptions to reflect salon focus
-- ========================================

-- Add comment to businesses table
COMMENT ON TABLE public.businesses IS 'Salon, beauty parlour, and barbershop business profiles';
