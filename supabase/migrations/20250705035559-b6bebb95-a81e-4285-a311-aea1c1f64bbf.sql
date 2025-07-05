
-- Phase 1: Critical Security Fixes

-- 1. First, ensure the app_role enum exists and has the correct values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- 2. Create user_roles table if it doesn't exist properly
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Drop problematic/duplicate RLS policies and create clean ones

-- Clean up auth_rate_limits policies
DROP POLICY IF EXISTS "System manages rate limits" ON public.auth_rate_limits;
DROP POLICY IF EXISTS "Allow system to manage rate limits for authentication" ON public.auth_rate_limits;

-- Create single, secure auth rate limits policy
CREATE POLICY "Secure_System_manages_auth_rate_limits"
ON public.auth_rate_limits
FOR ALL
USING (
  current_setting('role') IN ('service_role', 'supabase_admin') OR
  auth.uid() IS NOT NULL
)
WITH CHECK (
  current_setting('role') IN ('service_role', 'supabase_admin')
);

-- Clean up bookings policies - remove overly permissive ones
DROP POLICY IF EXISTS "allow_public_booking_creation" ON public.bookings;
DROP POLICY IF EXISTS "allow_public_booking_viewing" ON public.bookings;
DROP POLICY IF EXISTS "Public can view bookings by customer info" ON public.bookings;

-- Create secure booking policies
CREATE POLICY "Secure_Authenticated_users_can_create_bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (customer_email IS NOT NULL AND customer_phone IS NOT NULL)
);

-- Clean up clients policies - remove public creation
DROP POLICY IF EXISTS "allow_public_client_creation" ON public.clients;

-- Create secure client creation policy
CREATE POLICY "Secure_Business_owners_can_create_clients"
ON public.clients
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- 4. Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create proper user_roles policies
CREATE POLICY "Secure_Users_view_own_roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Secure_Admins_manage_all_roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Strengthen client_business_transactions policies
DROP POLICY IF EXISTS "System can insert client transactions" ON public.client_business_transactions;
DROP POLICY IF EXISTS "System can update client transactions" ON public.client_business_transactions;

-- More restrictive system policies for transactions
CREATE POLICY "Secure_Webhook_can_insert_transactions"
ON public.client_business_transactions
FOR INSERT
WITH CHECK (
  current_setting('role') = 'service_role' OR
  business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
);

CREATE POLICY "Secure_System_can_update_for_payment_processing"
ON public.client_business_transactions
FOR UPDATE
USING (
  current_setting('role') = 'service_role' OR
  business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
)
WITH CHECK (
  current_setting('role') = 'service_role' OR
  business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
);

-- 6. Add missing business ownership validation function
CREATE OR REPLACE FUNCTION public.validate_business_access(
  p_business_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
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
$$;

-- 7. Add enhanced payment security validation
CREATE OR REPLACE FUNCTION public.validate_payment_security_enhanced(
  p_amount NUMERIC,
  p_business_id UUID,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
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
$$;

-- 8. Add indexes for better security query performance
CREATE INDEX IF NOT EXISTS idx_audit_log_security_events 
ON public.audit_log(action, created_at DESC) 
WHERE action LIKE '%SECURITY%' OR action LIKE '%UNAUTHORIZED%';

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON public.user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_businesses_user_security 
ON public.businesses(user_id, is_active) 
WHERE is_active = true;
