-- Add 'payg' option to subscription_plan_type enum and add commission_rate column to subscriptions table

-- Create temp function to check if the enum value exists
DO $$
BEGIN
  -- Check if 'payg' already exists in the enum
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'subscription_plan_type'
    AND e.enumlabel = 'payg'
  ) THEN
    -- Add 'payg' to the enum
    ALTER TYPE subscription_plan_type ADD VALUE 'payg';
  END IF;
END
$$;

-- Add commission_rate column to subscriptions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subscriptions'
    AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN commission_rate NUMERIC;
  END IF;
END
$$;

-- Create function to handle pay-as-you-go subscription
CREATE OR REPLACE FUNCTION create_payg_subscription(
  user_id UUID,
  business_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
  one_year_from_now TIMESTAMPTZ;
BEGIN
  -- Calculate one year from now for the subscription period
  one_year_from_now := NOW() + INTERVAL '1 year';
  
  -- Upsert into subscriptions table
  INSERT INTO public.subscriptions (
    user_id,
    business_id,
    plan_type,
    status,
    current_period_end,
    staff_limit,
    bookings_limit,
    payment_interval,
    commission_rate
  )
  VALUES (
    user_id,
    business_id,
    'payg',
    'active',
    one_year_from_now,
    NULL, -- Unlimited staff
    NULL, -- Unlimited bookings
    'commission',
    0.05 -- 5% commission rate
  )
  ON CONFLICT (business_id) 
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    current_period_end = EXCLUDED.current_period_end,
    staff_limit = EXCLUDED.staff_limit,
    bookings_limit = EXCLUDED.bookings_limit,
    payment_interval = EXCLUDED.payment_interval,
    commission_rate = EXCLUDED.commission_rate,
    updated_at = NOW()
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;
