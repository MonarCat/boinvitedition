
-- First, create the enum type for subscription plan types
CREATE TYPE subscription_plan_type AS ENUM ('trial', 'starter', 'medium', 'premium', 'payasyougo');

-- Add new subscription plan types and payment intervals
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_interval TEXT DEFAULT 'monthly' CHECK (payment_interval IN ('monthly', 'quarterly', 'biannual', 'annual', '2year', '3year')),
ADD COLUMN IF NOT EXISTS paystack_subaccount_id TEXT,
ADD COLUMN IF NOT EXISTS auto_split_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS split_percentage NUMERIC DEFAULT 7.5;

-- Update the plan_type column to use the enum (if it's currently text)
-- First backup the current constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add booking reschedule tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_booking_date DATE,
ADD COLUMN IF NOT EXISTS original_booking_time TIME,
ADD COLUMN IF NOT EXISTS reschedule_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_payment_required BOOLEAN DEFAULT false;

-- Create table for tracking payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  business_id UUID REFERENCES public.businesses(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  paystack_reference TEXT UNIQUE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('booking_payment', 'subscription_payment', 'trial_activation')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  split_amount NUMERIC,
  business_amount NUMERIC,
  platform_amount NUMERIC,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment transactions
CREATE POLICY "Business owners can view their payment transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Create function to calculate reschedule deadline
CREATE OR REPLACE FUNCTION calculate_reschedule_deadline(booking_date DATE, booking_time TIME)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (booking_date + booking_time - INTERVAL '2 hours');
END;
$$;

-- Create trigger to set reschedule deadline on booking insert/update
CREATE OR REPLACE FUNCTION set_reschedule_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.reschedule_deadline := calculate_reschedule_deadline(NEW.booking_date, NEW.booking_time);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_reschedule_deadline_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_reschedule_deadline();

-- Add discount rates for long-term subscriptions
CREATE TABLE IF NOT EXISTS public.subscription_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_interval TEXT NOT NULL,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default discount rates
INSERT INTO public.subscription_discounts (payment_interval, discount_percentage) VALUES
('monthly', 0),
('quarterly', 5),
('biannual', 10),
('annual', 15),
('2year', 20),
('3year', 25)
ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_business_id ON public.payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_reschedule_deadline ON public.bookings(reschedule_deadline);
