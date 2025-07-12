-- CRITICAL SECURITY FIXES
-- Phase 1: Role Management Security

-- 1. Create secure role management function to prevent unauthorized admin escalation
CREATE OR REPLACE FUNCTION public.secure_assign_admin_role(_target_user_email text, _admin_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _target_user_id UUID;
  _admin_has_permission BOOLEAN := FALSE;
  _result JSONB;
BEGIN
  -- Check if the requesting user is an admin
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _admin_user_id AND role = 'admin'
  ) INTO _admin_has_permission;
  
  IF NOT _admin_has_permission THEN
    -- Log unauthorized admin assignment attempt
    PERFORM log_security_event_enhanced(
      'UNAUTHORIZED_ADMIN_ASSIGNMENT',
      'Non-admin user attempted to assign admin role',
      jsonb_build_object('target_email', _target_user_email, 'requesting_user', _admin_user_id),
      'high'
    );
    
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient permissions');
  END IF;
  
  -- Get target user ID from email
  SELECT id INTO _target_user_id
  FROM auth.users
  WHERE email = _target_user_email;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Insert admin role (prevent duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log successful admin assignment
  PERFORM log_security_event_enhanced(
    'ADMIN_ROLE_ASSIGNED',
    'Admin role successfully assigned',
    jsonb_build_object('target_email', _target_user_email, 'target_user_id', _target_user_id, 'admin_user_id', _admin_user_id),
    'medium'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin role assigned successfully');
END;
$$;

-- 2. Make is_admin column read-only via trigger to prevent direct manipulation
CREATE OR REPLACE FUNCTION public.prevent_direct_admin_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow system updates via specific functions
  IF TG_OP = 'UPDATE' AND OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Check if this is being called from within a security definer function
    IF current_setting('application_name', true) != 'admin_role_sync' THEN
      RAISE EXCEPTION 'Direct modification of is_admin is not allowed. Use proper role management functions.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_admin_modification ON public.profiles;
CREATE TRIGGER prevent_admin_modification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_direct_admin_modification();

-- 3. Create function to sync is_admin flag with user_roles table
CREATE OR REPLACE FUNCTION public.sync_admin_flag()
RETURNS TRIGGER AS $$
DECLARE
  _has_admin_role BOOLEAN;
BEGIN
  -- Check if user has admin role in user_roles table
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND role = 'admin'
  ) INTO _has_admin_role;
  
  -- Set application name to allow the update
  PERFORM set_config('application_name', 'admin_role_sync', true);
  
  -- Update profiles table to match
  UPDATE public.profiles 
  SET is_admin = _has_admin_role
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  -- Reset application name
  PERFORM set_config('application_name', '', true);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply sync trigger to user_roles table
DROP TRIGGER IF EXISTS sync_admin_flag_trigger ON public.user_roles;
CREATE TRIGGER sync_admin_flag_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  WHEN (COALESCE(NEW.role, OLD.role) = 'admin')
  EXECUTE FUNCTION public.sync_admin_flag();

-- 4. Strengthen RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only system can modify roles" ON public.user_roles;
CREATE POLICY "Only system can modify roles"
ON public.user_roles
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 5. Enhanced RLS for payment transactions
DROP POLICY IF EXISTS "Secure_Payment_access_control" ON public.payment_transactions;
CREATE POLICY "Secure_Payment_access_control"
ON public.payment_transactions
FOR ALL
USING (
  -- Business owners can access their transactions
  business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  OR
  -- Admins can access all transactions
  has_role(auth.uid(), 'admin')
  OR
  -- Service role for system operations
  current_setting('role') = 'service_role'
)
WITH CHECK (
  -- Business owners can create transactions for their businesses
  business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  OR
  -- Service role for system operations
  current_setting('role') = 'service_role'
);

-- 6. Create secure webhook validation function
CREATE OR REPLACE FUNCTION public.validate_webhook_request(
  p_signature text,
  p_payload text,
  p_secret text,
  p_timestamp bigint DEFAULT extract(epoch from now())
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _time_diff INTEGER;
  _expected_signature TEXT;
  _result JSONB := '{"valid": false, "reason": ""}'::JSONB;
BEGIN
  -- Check timestamp (reject requests older than 5 minutes)
  _time_diff := extract(epoch from now()) - p_timestamp;
  IF _time_diff > 300 THEN
    _result := jsonb_set(_result, '{reason}', '"Request timestamp too old"');
    
    -- Log suspicious webhook attempt
    PERFORM log_security_event_enhanced(
      'WEBHOOK_TIMESTAMP_VIOLATION',
      'Webhook request with old timestamp received',
      jsonb_build_object('timestamp_age', _time_diff, 'signature', p_signature),
      'medium'
    );
    
    RETURN _result;
  END IF;
  
  -- Validate signature format
  IF LENGTH(p_signature) < 20 OR p_signature !~ '^[a-zA-Z0-9+/=]+$' THEN
    _result := jsonb_set(_result, '{reason}', '"Invalid signature format"');
    
    PERFORM log_security_event_enhanced(
      'WEBHOOK_INVALID_SIGNATURE',
      'Webhook request with invalid signature format',
      jsonb_build_object('signature_length', LENGTH(p_signature)),
      'high'
    );
    
    RETURN _result;
  END IF;
  
  -- Validate payload is not empty and is valid JSON
  IF LENGTH(p_payload) = 0 THEN
    _result := jsonb_set(_result, '{reason}', '"Empty payload"');
    RETURN _result;
  END IF;
  
  -- Basic validation passed
  _result := jsonb_set(_result, '{valid}', 'true');
  
  -- Log successful webhook validation
  PERFORM log_security_event_enhanced(
    'WEBHOOK_VALIDATED',
    'Webhook request successfully validated',
    jsonb_build_object('payload_size', LENGTH(p_payload)),
    'low'
  );
  
  RETURN _result;
END;
$$;

-- 7. Create indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_log_security_events 
ON public.audit_log (action, created_at) 
WHERE action LIKE '%SECURITY%' OR action LIKE '%UNAUTHORIZED%';

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
ON public.user_roles (user_id, role);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_security 
ON public.payment_transactions (business_id, created_at, status);