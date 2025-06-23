
-- Add location info and IP tracking to staff_attendance table
ALTER TABLE public.staff_attendance 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS geolocation JSONB;

-- Create fraud detection function
CREATE OR REPLACE FUNCTION check_duplicate_signins()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for fraud detection
DROP TRIGGER IF EXISTS prevent_duplicate_signins ON public.staff_attendance;
CREATE TRIGGER prevent_duplicate_signins
  BEFORE INSERT ON public.staff_attendance
  FOR EACH ROW EXECUTE FUNCTION check_duplicate_signins();

-- Create admin alerts table
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for admin alerts
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their alerts"
  ON public.admin_alerts
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create alerts"
  ON public.admin_alerts
  FOR INSERT
  WITH CHECK (true);

-- Add operating hours to business settings
ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS operating_hours_start TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS operating_hours_end TIME DEFAULT '18:00:00';

-- Create function to log suspicious activity
CREATE OR REPLACE FUNCTION log_suspicious_activity()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for suspicious activity logging
DROP TRIGGER IF EXISTS log_suspicious_signin ON public.staff_attendance;
CREATE TRIGGER log_suspicious_signin
  AFTER INSERT ON public.staff_attendance
  FOR EACH ROW EXECUTE FUNCTION log_suspicious_activity();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_alerts_business_created 
ON public.admin_alerts(business_id, created_at DESC);
