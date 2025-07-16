-- CRITICAL SECURITY FIX: Add search_path protection to all functions
-- This prevents privilege escalation attacks via search_path manipulation

-- Fix function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix function: get_user_roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
 RETURNS TABLE(role app_role)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
$function$;

-- Fix function: assign_admin_role
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _user_email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _user_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;

-- Fix function: calculate_distance
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = ''
AS $function$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$function$;

-- Fix function: generate_ticket_code
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  RETURN 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 8));
END;
$function$;

-- Fix function: calculate_reschedule_deadline
CREATE OR REPLACE FUNCTION public.calculate_reschedule_deadline(booking_date date, booking_time time without time zone)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  RETURN (booking_date + booking_time - INTERVAL '2 hours');
END;
$function$;

-- Fix function: validate_business_ownership
CREATE OR REPLACE FUNCTION public.validate_business_ownership(business_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND user_id = auth.uid()
  );
$function$;

-- Fix function: is_business_owner
CREATE OR REPLACE FUNCTION public.is_business_owner(_business_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = _business_id AND user_id = auth.uid()
  );
$function$;

-- Fix function: log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: validate_payment_amount
CREATE OR REPLACE FUNCTION public.validate_payment_amount(p_amount numeric, p_business_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_attempt_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: create_paid_subscription
CREATE OR REPLACE FUNCTION public.create_paid_subscription(business_id uuid, plan_type text, paystack_reference text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  subscription_id UUID;
  staff_limit_val INTEGER;
  bookings_limit_val INTEGER;
  period_end TIMESTAMPTZ;
  user_id_val UUID;
BEGIN
  -- Set limits based on plan type
  CASE plan_type
    WHEN 'starter' THEN
      staff_limit_val := 5;
      bookings_limit_val := 1000;
    WHEN 'medium' THEN
      staff_limit_val := 15;
      bookings_limit_val := 3000;
    WHEN 'premium' THEN
      staff_limit_val := NULL; -- Unlimited
      bookings_limit_val := NULL; -- Unlimited
    ELSE
      staff_limit_val := 3;
      bookings_limit_val := 500;
  END CASE;
  
  -- Set period end to 1 month from now
  period_end := NOW() + INTERVAL '1 month';
  
  -- Get user_id from business
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
    staff_limit,
    bookings_limit
  )
  VALUES (
    user_id_val,
    business_id,
    plan_type,
    'active',
    period_end,
    staff_limit_val,
    bookings_limit_val
  )
  ON CONFLICT (business_id)
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    current_period_end = EXCLUDED.current_period_end,
    staff_limit = EXCLUDED.staff_limit,
    bookings_limit = EXCLUDED.bookings_limit,
    updated_at = NOW()
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$function$;

-- Fix function: safe_rate_limit_check
CREATE OR REPLACE FUNCTION public.safe_rate_limit_check(p_identifier text, p_attempt_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: validate_webhook_security
CREATE OR REPLACE FUNCTION public.validate_webhook_security(p_payload text, p_signature text, p_secret text, p_timestamp timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _result JSONB := '{"valid": false, "reason": ""}'::JSONB;
  _time_diff INTERVAL;
BEGIN
  -- Validate timestamp (reject requests older than 5 minutes)
  _time_diff := NOW() - p_timestamp;
  IF _time_diff > INTERVAL '5 minutes' THEN
    _result := jsonb_set(_result, '{reason}', '"Request too old"');
    RETURN _result;
  END IF;
  
  -- Validate signature length
  IF LENGTH(p_signature) < 10 THEN
    _result := jsonb_set(_result, '{reason}', '"Invalid signature format"');
    RETURN _result;
  END IF;
  
  -- Validate payload is not empty
  IF LENGTH(p_payload) = 0 THEN
    _result := jsonb_set(_result, '{reason}', '"Empty payload"');
    RETURN _result;
  END IF;
  
  -- Basic validation passed
  _result := jsonb_set(_result, '{valid}', 'true');
  RETURN _result;
END;
$function$;

-- Fix function: secure_validate_business_ownership
CREATE OR REPLACE FUNCTION public.secure_validate_business_ownership(p_business_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _is_owner BOOLEAN := FALSE;
BEGIN
  -- Check ownership
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = p_business_id AND user_id = p_user_id
  ) INTO _is_owner;
  
  -- Log access attempt
  INSERT INTO public.audit_log (
    action,
    table_name,
    old_values,
    new_values,
    user_id
  )
  VALUES (
    'BUSINESS_ACCESS_CHECK',
    'businesses',
    jsonb_build_object('business_id', p_business_id),
    jsonb_build_object('access_granted', _is_owner),
    p_user_id
  );
  
  RETURN _is_owner;
END;
$function$;

-- Fix function: log_security_event_enhanced
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(p_event_type text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'medium'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: validate_payment_security
CREATE OR REPLACE FUNCTION public.validate_payment_security(_amount numeric, _business_id uuid, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _result JSONB := '{"valid": true, "warnings": []}'::JSONB;
  _warnings TEXT[] := ARRAY[]::TEXT[];
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  
  -- Check for suspicious large amounts
  IF _amount > 100000 THEN
    _warnings := array_append(_warnings, 'Large payment amount detected');
    
    -- Log high-value transaction
    INSERT INTO public.audit_log (action, table_name, old_values, new_values, user_id)
    VALUES (
      'SECURITY_EVENT',
      'HIGH_VALUE_PAYMENT',
      jsonb_build_object('amount', _amount, 'business_id', _business_id),
      _metadata,
      _user_id
    );
  END IF;
  
  -- Check payment frequency (more than 10 payments in last hour)
  IF EXISTS (
    SELECT 1 FROM public.payment_transactions 
    WHERE business_id = _business_id 
    AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY business_id
    HAVING COUNT(*) > 10
  ) THEN
    _warnings := array_append(_warnings, 'High payment frequency detected');
    
    INSERT INTO public.audit_log (action, table_name, old_values, new_values, user_id)
    VALUES (
      'SECURITY_EVENT',
      'HIGH_PAYMENT_FREQUENCY',
      jsonb_build_object('business_id', _business_id, 'amount', _amount),
      _metadata,
      _user_id
    );
  END IF;
  
  -- Update result with warnings
  IF array_length(_warnings, 1) > 0 THEN
    _result := jsonb_set(_result, '{warnings}', to_jsonb(_warnings));
  END IF;
  
  RETURN _result;
END;
$function$;

-- Fix function: get_admin_stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'business_count', (SELECT COUNT(*) FROM public.businesses WHERE is_active = true),
    'active_users', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '30 days'),
    'total_bookings', (SELECT COUNT(*) FROM public.bookings),
    'today_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payment_transactions WHERE created_at::date = NOW()::date),
    'pending_payouts', (SELECT COUNT(*) FROM public.business_payouts WHERE is_verified = false),
    'platform_fees_today', (SELECT COALESCE(SUM(platform_fee_amount), 0) FROM public.payment_transactions WHERE created_at::date = NOW()::date),
    'new_signups_today', (SELECT COUNT(*) FROM auth.users WHERE created_at::date = NOW()::date)
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Fix function: is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$function$;

-- Fix function: secure_assign_admin_role (CRITICAL - Enhanced security)
CREATE OR REPLACE FUNCTION public.secure_assign_admin_role(_target_user_email text, _admin_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _target_user_id UUID;
  _admin_has_permission BOOLEAN := FALSE;
  _result JSONB;
  _requesting_user_email TEXT;
BEGIN
  -- Enhanced validation: Check if the requesting user is an admin
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _admin_user_id AND role = 'admin'
  ) INTO _admin_has_permission;
  
  -- Get requesting user email for logging
  SELECT email INTO _requesting_user_email FROM auth.users WHERE id = _admin_user_id;
  
  IF NOT _admin_has_permission THEN
    -- Log unauthorized admin assignment attempt with enhanced details
    PERFORM log_security_event_enhanced(
      'UNAUTHORIZED_ADMIN_ASSIGNMENT',
      'Non-admin user attempted to assign admin role',
      jsonb_build_object(
        'target_email', _target_user_email, 
        'requesting_user', _admin_user_id,
        'requesting_user_email', _requesting_user_email,
        'timestamp', NOW(),
        'severity', 'CRITICAL'
      ),
      'critical'
    );
    
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient permissions');
  END IF;
  
  -- Additional validation: Prevent self-assignment if not already admin
  IF _target_user_email = _requesting_user_email THEN
    PERFORM log_security_event_enhanced(
      'SELF_ADMIN_ASSIGNMENT_ATTEMPT',
      'User attempted to assign admin role to themselves',
      jsonb_build_object(
        'user_email', _target_user_email,
        'user_id', _admin_user_id
      ),
      'high'
    );
  END IF;
  
  -- Get target user ID from email
  SELECT id INTO _target_user_id
  FROM auth.users
  WHERE email = _target_user_email;
  
  IF _target_user_id IS NULL THEN
    -- Log attempt to assign role to non-existent user
    PERFORM log_security_event_enhanced(
      'ADMIN_ASSIGNMENT_INVALID_USER',
      'Admin role assignment attempted for non-existent user',
      jsonb_build_object(
        'target_email', _target_user_email,
        'requesting_user', _admin_user_id
      ),
      'medium'
    );
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Insert admin role (prevent duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log successful admin assignment with full audit trail
  PERFORM log_security_event_enhanced(
    'ADMIN_ROLE_ASSIGNED',
    'Admin role successfully assigned',
    jsonb_build_object(
      'target_email', _target_user_email, 
      'target_user_id', _target_user_id, 
      'admin_user_id', _admin_user_id,
      'admin_user_email', _requesting_user_email,
      'timestamp', NOW()
    ),
    'medium'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin role assigned successfully');
END;
$function$;

-- Fix remaining functions with search_path protection
CREATE OR REPLACE FUNCTION public.validate_business_access(p_business_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _has_access BOOLEAN := FALSE;
BEGIN
  -- Check if user owns the business
  SELECT EXISTS(
    SELECT 1 FROM public.businesses 
    WHERE id = p_business_id AND user_id = p_user_id AND is_active = true
  ) INTO _has_access;
  
  -- Log access check for security monitoring
  IF NOT _has_access THEN
    INSERT INTO public.audit_log (
      action, table_name, old_values, new_values, user_id
    ) VALUES (
      'UNAUTHORIZED_BUSINESS_ACCESS',
      'businesses',
      jsonb_build_object('business_id', p_business_id),
      jsonb_build_object('access_denied', true),
      p_user_id
    );
  END IF;
  
  RETURN _has_access;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_payment_security_enhanced(p_amount numeric, p_business_id uuid, p_payment_method text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _result JSONB := '{"valid": true, "warnings": [], "flags": []}'::JSONB;
  _warnings TEXT[] := ARRAY[]::TEXT[];
  _flags TEXT[] := ARRAY[]::TEXT[];
  _recent_transactions INTEGER;
BEGIN
  -- Validate amount limits (consistent 1M KES limit)
  IF p_amount > 1000000 THEN
    _warnings := array_append(_warnings, 'Amount exceeds maximum limit');
    _result := jsonb_set(_result, '{valid}', 'false');
  END IF;
  
  IF p_amount <= 0 THEN
    _warnings := array_append(_warnings, 'Invalid amount');
    _result := jsonb_set(_result, '{valid}', 'false');
  END IF;
  
  -- Check for suspicious transaction patterns
  SELECT COUNT(*) INTO _recent_transactions
  FROM public.payment_transactions 
  WHERE business_id = p_business_id 
    AND created_at > NOW() - INTERVAL '1 hour'
    AND amount > 50000;
    
  IF _recent_transactions > 5 THEN
    _flags := array_append(_flags, 'High frequency large transactions');
  END IF;
  
  -- Update result with warnings and flags
  IF array_length(_warnings, 1) > 0 THEN
    _result := jsonb_set(_result, '{warnings}', to_jsonb(_warnings));
  END IF;
  
  IF array_length(_flags, 1) > 0 THEN
    _result := jsonb_set(_result, '{flags}', to_jsonb(_flags));
  END IF;
  
  RETURN _result;
END;
$function$;