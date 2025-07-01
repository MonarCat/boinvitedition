-- Add 'commission' to the payment_interval_type enum if it doesn't already exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'payment_interval_type'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'payment_interval_type' 
        AND pg_enum.enumlabel = 'commission'
    ) THEN
        ALTER TYPE payment_interval_type ADD VALUE 'commission';
    END IF;
END
$$;

-- Drop the old constraint if it exists and create a new one that includes 'commission'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscriptions_payment_interval_check' AND contype = 'c'
    ) THEN
        ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_payment_interval_check;
    END IF;

    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_payment_interval_check
    CHECK (payment_interval::text = ANY (ARRAY['monthly'::text, 'yearly'::text, 'lifetime'::text, 'commission'::text, 'one-time'::text, 'trial']));
END
$$;

-- Ensure the commission_rate column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subscriptions'
    AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN commission_rate NUMERIC(5, 4) CHECK (commission_rate >= 0 AND commission_rate <= 1);
  END IF;
END
$$;

-- Update the create_payg_subscription function to be idempotent and correct
CREATE OR REPLACE FUNCTION create_payg_subscription(
  p_user_id UUID,
  p_business_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_one_year_from_now TIMESTAMPTZ := NOW() + INTERVAL '1 year';
BEGIN
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
    p_user_id,
    p_business_id,
    'payg',
    'active',
    v_one_year_from_now,
    NULL, -- Unlimited staff
    NULL, -- Unlimited bookings
    'commission', -- Correct interval for PAYG
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
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$;
