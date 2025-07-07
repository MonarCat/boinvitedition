
-- Add is_admin flag to profiles table (since we're using profiles for user data)
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create admin stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON 
SECURITY DEFINER
AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to check admin status
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for admin access to all businesses
CREATE POLICY "Admins can view all businesses" ON public.businesses
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Add RLS policy for admin access to all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Add RLS policy for admin access to all payment transactions
CREATE POLICY "Admins can view all payment transactions" ON public.payment_transactions
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policy for admins to insert audit logs
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
FOR INSERT WITH CHECK (
  admin_id = auth.uid() AND 
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
