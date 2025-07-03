
-- Fix overly permissive RLS policies and add missing security controls

-- 1. Fix auth_rate_limits policy (currently blocks all access)
DROP POLICY IF EXISTS "Allow system to manage rate limits for authentication" ON public.auth_rate_limits;

-- Create more restrictive auth rate limits policy
CREATE POLICY "System can manage auth rate limits"
  ON public.auth_rate_limits
  FOR ALL
  USING (
    -- Only allow system operations for rate limiting
    current_setting('role') = 'service_role' OR
    current_setting('role') = 'supabase_admin'
  )
  WITH CHECK (
    current_setting('role') = 'service_role' OR
    current_setting('role') = 'supabase_admin'
  );

-- 2. Strengthen bookings RLS policies
DROP POLICY IF EXISTS "allow_public_booking_creation" ON public.bookings;
DROP POLICY IF EXISTS "allow_public_booking_viewing" ON public.bookings;

-- More restrictive booking policies
CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (
    -- Allow authenticated users to create bookings for any business
    auth.role() = 'authenticated' OR
    -- Or allow anonymous users with valid customer info
    (customer_email IS NOT NULL AND customer_phone IS NOT NULL)
  );

CREATE POLICY "Users can view bookings with proper authorization"
  ON public.bookings
  FOR SELECT
  USING (
    -- Business owners can see their bookings
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ) OR
    -- Customers can see their own bookings via email
    customer_email = auth.email() OR
    -- Or via client relationship
    client_id IN (
      SELECT id FROM public.clients WHERE email = auth.email()
    )
  );

-- 3. Strengthen clients RLS policies
DROP POLICY IF EXISTS "allow_public_client_viewing" ON public.clients;

CREATE POLICY "Restricted client viewing"
  ON public.clients
  FOR SELECT
  USING (
    -- Business owners can see their clients
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ) OR
    -- Clients can see their own record
    email = auth.email()
  );

-- 4. Add business amount validation function
CREATE OR REPLACE FUNCTION public.validate_payment_amount(
  p_amount NUMERIC,
  p_business_id UUID
) RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  max_service_price NUMERIC;
BEGIN
  -- Get the maximum service price for the business
  SELECT COALESCE(MAX(price), 0) INTO max_service_price
  FROM public.services
  WHERE business_id = p_business_id AND is_active = true;
  
  -- Allow amounts up to 5x the max service price (for multiple services/tips)
  RETURN p_amount <= (max_service_price * 5) AND p_amount > 0;
END;
$$;

-- 5. Add payment transaction validation
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT check_valid_payment_amount 
CHECK (amount > 0 AND amount < 1000000); -- Max 1M KES

-- 6. Add enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB,
  p_severity TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
  current_ip TEXT;
  current_user_agent TEXT;
BEGIN
  -- Capture request metadata
  current_ip := current_setting('request.headers', true)::JSONB ->> 'x-real-ip';
  current_user_agent := current_setting('request.headers', true)::JSONB ->> 'user-agent';
  
  INSERT INTO public.audit_log (
    action,
    table_name,
    old_values,
    new_values,
    user_id,
    ip_address,
    user_agent
  )
  VALUES (
    'SECURITY_EVENT',
    p_event_type,
    jsonb_build_object(
      'description', p_description,
      'severity', p_severity,
      'timestamp', NOW()
    ),
    p_metadata,
    auth.uid(),
    current_ip,
    current_user_agent
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 7. Add rate limiting tracking
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_lookup 
ON public.auth_rate_limits(identifier, attempt_type, window_start);

-- 8. Add business ownership validation trigger
CREATE OR REPLACE FUNCTION public.validate_business_ownership_trigger()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Log access attempts for sensitive operations
  PERFORM public.log_security_event_enhanced(
    'BUSINESS_OPERATION',
    format('User %s performed %s on business %s', 
      auth.uid()::TEXT, 
      TG_OP, 
      COALESCE(NEW.business_id, OLD.business_id)::TEXT
    ),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'business_id', COALESCE(NEW.business_id, OLD.business_id)
    ),
    'low'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers for business operation logging
CREATE TRIGGER log_booking_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_business_ownership_trigger();

CREATE TRIGGER log_client_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_business_ownership_trigger();

-- 9. Create secure CORS configuration table
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert secure CORS configuration
INSERT INTO public.app_config (config_key, config_value)
VALUES (
  'cors_origins',
  '["https://boinvit.com", "https://app.boinvit.com", "http://localhost:3000", "http://localhost:5173"]'::JSONB
) ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

-- RLS for app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app config"
  ON public.app_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read cors config"
  ON public.app_config
  FOR SELECT
  USING (config_key = 'cors_origins');
