-- Fix remaining trigger functions with search_path protection

-- Fix function: auto_generate_ticket_code
CREATE OR REPLACE FUNCTION public.auto_generate_ticket_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := generate_ticket_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: update_business_search_vector
CREATE OR REPLACE FUNCTION public.update_business_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'D');
  RETURN NEW;
END;
$function$;

-- Fix function: set_reschedule_deadline
CREATE OR REPLACE FUNCTION public.set_reschedule_deadline()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.reschedule_deadline := calculate_reschedule_deadline(NEW.booking_date, NEW.booking_time);
  RETURN NEW;
END;
$function$;

-- Fix function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Fix function: update_business_payment_configs_updated_at
CREATE OR REPLACE FUNCTION public.update_business_payment_configs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix function: check_duplicate_signins
CREATE OR REPLACE FUNCTION public.check_duplicate_signins()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Check for duplicate sign-ins within 5 minutes
  IF NEW.status = 'signed_in' AND EXISTS (
    SELECT 1 FROM staff_attendance
    WHERE staff_id = NEW.staff_id
    AND status = 'signed_in'
    AND sign_in_time > NOW() - INTERVAL '5 minutes'
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Duplicate sign-in detected within 5 minutes';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix function: log_suspicious_activity
CREATE OR REPLACE FUNCTION public.log_suspicious_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  business_start_time TIME;
  business_end_time TIME;
  signin_time TIME;
BEGIN
  -- Get business operating hours
  SELECT operating_hours_start, operating_hours_end
  INTO business_start_time, business_end_time
  FROM business_settings
  WHERE business_id = NEW.business_id;
  
  signin_time := NEW.sign_in_time::TIME;
  
  -- Check if sign-in is outside business hours
  IF signin_time < COALESCE(business_start_time, '08:00:00'::TIME) 
     OR signin_time > COALESCE(business_end_time, '18:00:00'::TIME) THEN
    
    INSERT INTO admin_alerts (business_id, alert_type, message, metadata)
    VALUES (
      NEW.business_id,
      'OUTSIDE_HOURS_SIGNIN',
      'Staff signed in outside business hours',
      jsonb_build_object(
        'staff_id', NEW.staff_id,
        'sign_in_time', NEW.sign_in_time,
        'business_hours', jsonb_build_object(
          'start', business_start_time,
          'end', business_end_time
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix function: prevent_direct_admin_modification
CREATE OR REPLACE FUNCTION public.prevent_direct_admin_modification()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: sync_admin_flag
CREATE OR REPLACE FUNCTION public.sync_admin_flag()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _has_admin_role BOOLEAN;
  _user_id UUID;
BEGIN
  -- Get the affected user_id
  IF TG_OP = 'DELETE' THEN
    _user_id := OLD.user_id;
  ELSE
    _user_id := NEW.user_id;
  END IF;
  
  -- Only proceed if this involves admin role
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
     (TG_OP IN ('INSERT', 'UPDATE') AND NEW.role = 'admin') THEN
    
    -- Check if user has admin role in user_roles table
    SELECT EXISTS(
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'admin'
    ) INTO _has_admin_role;
    
    -- Set application name to allow the update
    PERFORM set_config('application_name', 'admin_role_sync', true);
    
    -- Update profiles table to match
    UPDATE public.profiles 
    SET is_admin = _has_admin_role
    WHERE id = _user_id;
    
    -- Reset application name
    PERFORM set_config('application_name', '', true);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix function: validate_business_ownership_trigger
CREATE OR REPLACE FUNCTION public.validate_business_ownership_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix function: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix function: update_business_rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    UPDATE public.businesses
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.business_reviews
            WHERE business_id = NEW.business_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.business_reviews
            WHERE business_id = NEW.business_id
        )
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$function$;