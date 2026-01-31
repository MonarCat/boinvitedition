-- Add onboarding fields to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS primary_use_cases text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.businesses.company_size IS 'Company size range: 1-50, 51-100, 101-250, 251-500, 500+';
COMMENT ON COLUMN public.businesses.primary_use_cases IS 'Primary use cases: trainings, town_halls, compliance, onboarding, workshops, team_meetings';