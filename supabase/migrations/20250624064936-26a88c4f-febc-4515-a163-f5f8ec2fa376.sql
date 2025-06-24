
-- Add comprehensive RLS policies for tables missing them

-- 1. Audit Log RLS Policies
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Notification Log RLS Policies
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their notifications"
  ON public.notification_log
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert their notifications"
  ON public.notification_log
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- 3. Payment Transactions RLS Policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their payment transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert their payment transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- 4. Admin Alerts RLS Policies
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their admin alerts"
  ON public.admin_alerts
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert admin alerts"
  ON public.admin_alerts
  FOR INSERT
  WITH CHECK (true);

-- 5. Client Business Transactions RLS Policies
ALTER TABLE public.client_business_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their client transactions"
  ON public.client_business_transactions
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- 6. Business Payment Settings RLS Policies
ALTER TABLE public.business_payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their payment settings"
  ON public.business_payment_settings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- 7. Business Payouts RLS Policies
ALTER TABLE public.business_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their payout settings"
  ON public.business_payouts
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- 8. Create security function for enhanced role checking
CREATE OR REPLACE FUNCTION public.is_business_owner(_business_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = _business_id AND user_id = auth.uid()
  );
$$;

-- 9. Create function to log security events safely
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.audit_log (
    action,
    table_name,
    old_values,
    new_values,
    user_id
  )
  VALUES (
    'SECURITY_EVENT',
    p_event_type,
    jsonb_build_object('description', p_description),
    p_metadata,
    auth.uid()
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 10. Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email or IP
  attempt_type TEXT NOT NULL, -- 'login', 'signup', 'reset'
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits are managed by the system, no user access needed
CREATE POLICY "System manages rate limits"
  ON public.auth_rate_limits
  FOR ALL
  USING (false);

-- 11. Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
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
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Get or create rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier 
    AND attempt_type = p_attempt_type
    AND window_start > window_start;
  
  IF current_record IS NULL THEN
    -- Create new record
    INSERT INTO public.auth_rate_limits (identifier, attempt_type, attempts, window_start)
    VALUES (p_identifier, p_attempt_type, 1, NOW());
    RETURN TRUE;
  ELSE
    -- Check if blocked
    IF current_record.blocked_until IS NOT NULL AND current_record.blocked_until > NOW() THEN
      RETURN FALSE;
    END IF;
    
    -- Check attempts
    IF current_record.attempts >= p_max_attempts THEN
      -- Block for window period
      UPDATE public.auth_rate_limits
      SET blocked_until = NOW() + INTERVAL '1 minute' * p_window_minutes,
          updated_at = NOW()
      WHERE id = current_record.id;
      RETURN FALSE;
    ELSE
      -- Increment attempts
      UPDATE public.auth_rate_limits
      SET attempts = attempts + 1,
          updated_at = NOW()
      WHERE id = current_record.id;
      RETURN TRUE;
    END IF;
  END IF;
END;
$$;
