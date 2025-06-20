
-- Add notification preferences and feature flags to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS notification_channels jsonb DEFAULT '{"email": true, "sms": false, "whatsapp": false}'::jsonb,
ADD COLUMN IF NOT EXISTS feature_flags jsonb DEFAULT '{}'::jsonb;

-- Add payment status and reminder tracking to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS ticket_code text UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_generated boolean DEFAULT false;

-- Add client data retention flag for starter plan
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS retain_data boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_service_date timestamptz;

-- Create notification log table
CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms', 'whatsapp')),
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on notification_log
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_log
CREATE POLICY "Business owners can view their notification logs" 
  ON public.notification_log 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert their notification logs" 
  ON public.notification_log 
  FOR INSERT 
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_log_booking_id ON public.notification_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_business_id ON public.notification_log(business_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON public.notification_log(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_code ON public.bookings(ticket_code);

-- Function to generate ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code() RETURNS text AS $$
BEGIN
  RETURN 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket codes
CREATE OR REPLACE FUNCTION auto_generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := generate_ticket_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_ticket_code
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket_code();

-- Update subscription functions to handle new starter plan
DROP FUNCTION IF EXISTS public.create_paid_subscription(uuid, text, text);
CREATE OR REPLACE FUNCTION create_paid_subscription(
  business_id UUID,
  plan_type TEXT,
  stripe_subscription_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
  staff_limit_val INTEGER;
  bookings_limit_val INTEGER;
  period_end TIMESTAMPTZ;
  notification_channels_val JSONB;
  feature_flags_val JSONB;
BEGIN
  -- Set limits and features based on plan type
  IF plan_type = 'starter' THEN
    staff_limit_val := 3;
    bookings_limit_val := 1000;
    notification_channels_val := '{"email": true, "sms": false, "whatsapp": false}'::jsonb;
    feature_flags_val := '{"can_add_clients": false, "client_data_retention": false}'::jsonb;
  ELSIF plan_type = 'medium' THEN
    staff_limit_val := 15;
    bookings_limit_val := 3000;
    notification_channels_val := '{"email": true, "sms": true, "whatsapp": true}'::jsonb;
    feature_flags_val := '{"can_add_clients": true, "client_data_retention": true}'::jsonb;
  ELSIF plan_type = 'premium' THEN
    staff_limit_val := NULL; -- Unlimited
    bookings_limit_val := NULL; -- Unlimited
    notification_channels_val := '{"email": true, "sms": true, "whatsapp": true}'::jsonb;
    feature_flags_val := '{"can_add_clients": true, "client_data_retention": true, "api_access": true}'::jsonb;
  END IF;
  
  -- Set period end to 1 month from now
  period_end := NOW() + INTERVAL '1 month';
  
  -- Get user_id from business
  DECLARE
    user_id_val UUID;
  BEGIN
    SELECT b.user_id INTO user_id_val
    FROM public.businesses b
    WHERE b.id = business_id;
    
    -- Upsert subscription
    INSERT INTO public.subscriptions (
      user_id,
      business_id,
      plan_type,
      status,
      current_period_end,
      stripe_subscription_id,
      staff_limit,
      bookings_limit,
      notification_channels,
      feature_flags
    )
    VALUES (
      user_id_val,
      business_id,
      plan_type,
      'active',
      period_end,
      stripe_subscription_id,
      staff_limit_val,
      bookings_limit_val,
      notification_channels_val,
      feature_flags_val
    )
    ON CONFLICT (business_id)
    DO UPDATE SET
      plan_type = EXCLUDED.plan_type,
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      staff_limit = EXCLUDED.staff_limit,
      bookings_limit = EXCLUDED.bookings_limit,
      notification_channels = EXCLUDED.notification_channels,
      feature_flags = EXCLUDED.feature_flags,
      updated_at = NOW()
    RETURNING id INTO subscription_id;
  END;
  
  RETURN subscription_id;
END;
$$;
