
-- Phase 1: Critical RLS Policy Cleanup

-- Drop conflicting policies on admin_alerts table
DROP POLICY IF EXISTS "Business owners can view their admin alerts" ON public.admin_alerts;
DROP POLICY IF EXISTS "System can insert admin alerts" ON public.admin_alerts;

-- Create consolidated admin_alerts policies
CREATE POLICY "Business owners can manage their admin alerts"
  ON public.admin_alerts
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Drop conflicting policies on clients table
DROP POLICY IF EXISTS "Users can view clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients for their business" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients for their business" ON public.clients;

-- Create consolidated clients policies using auth.uid() consistently
CREATE POLICY "Business owners can manage their clients"
  ON public.clients
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Drop conflicting policies on audit_log table
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_log;

-- Create consolidated audit_log policies
CREATE POLICY "Users can manage their own audit logs"
  ON public.audit_log
  FOR ALL
  USING (user_id = auth.uid());

-- Drop conflicting policies on notification_log table
DROP POLICY IF EXISTS "Business owners can view their notifications" ON public.notification_log;
DROP POLICY IF EXISTS "Business owners can insert their notifications" ON public.notification_log;

-- Create consolidated notification_log policies
CREATE POLICY "Business owners can manage their notifications"
  ON public.notification_log
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Drop conflicting policies on payment_transactions table
DROP POLICY IF EXISTS "Business owners can view their payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Business owners can insert their payment transactions" ON public.payment_transactions;

-- Create consolidated payment_transactions policies
CREATE POLICY "Business owners can manage their payment transactions"
  ON public.payment_transactions
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Drop conflicting policies on client_business_transactions table
DROP POLICY IF EXISTS "Business owners can view their transactions" ON public.client_business_transactions;
DROP POLICY IF EXISTS "Clients can view their transactions" ON public.client_business_transactions;

-- Create consolidated client_business_transactions policies
CREATE POLICY "Business owners can manage their client transactions"
  ON public.client_business_transactions
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view their own transactions"
  ON public.client_business_transactions
  FOR SELECT
  USING (
    client_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Add missing RLS policies for tables that need them
CREATE POLICY "Business owners can manage their settings"
  ON public.business_settings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their services"
  ON public.services
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their staff"
  ON public.staff
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their bookings"
  ON public.bookings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Public booking access for QR code functionality
CREATE POLICY "Public can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Update rate limiting table security
DROP POLICY IF EXISTS "System manages rate limits" ON public.auth_rate_limits;

CREATE POLICY "System manages rate limits"
  ON public.auth_rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Create function to safely manage rate limits
CREATE OR REPLACE FUNCTION public.safe_rate_limit_check(
  p_identifier TEXT,
  p_attempt_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Input validation
  IF p_identifier IS NULL OR p_attempt_type IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Sanitize inputs
  p_identifier := regexp_replace(p_identifier, '[^a-zA-Z0-9@._-]', '', 'g');
  p_attempt_type := regexp_replace(p_attempt_type, '[^a-zA-Z_]', '', 'g');
  
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Get or create rate limit record with better error handling
  BEGIN
    SELECT * INTO current_record
    FROM public.auth_rate_limits
    WHERE identifier = p_identifier 
      AND attempt_type = p_attempt_type
      AND window_start > window_start;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;
  
  IF current_record IS NULL THEN
    -- Create new record with error handling
    BEGIN
      INSERT INTO public.auth_rate_limits (identifier, attempt_type, attempts, window_start)
      VALUES (p_identifier, p_attempt_type, 1, NOW());
      RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
      RETURN FALSE;
    END;
  ELSE
    -- Check if blocked
    IF current_record.blocked_until IS NOT NULL AND current_record.blocked_until > NOW() THEN
      RETURN FALSE;
    END IF;
    
    -- Check attempts
    IF current_record.attempts >= p_max_attempts THEN
      -- Block for window period
      BEGIN
        UPDATE public.auth_rate_limits
        SET blocked_until = NOW() + INTERVAL '1 minute' * p_window_minutes,
            updated_at = NOW()
        WHERE id = current_record.id;
        RETURN FALSE;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    ELSE
      -- Increment attempts
      BEGIN
        UPDATE public.auth_rate_limits
        SET attempts = attempts + 1,
            updated_at = NOW()
        WHERE id = current_record.id;
        RETURN TRUE;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    END IF;
  END IF;
END;
$$;
