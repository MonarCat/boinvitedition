
-- Drop all existing policies that might conflict (comprehensive cleanup)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business owners can view their payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Business owners view payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Anyone can view all reviews" ON public.business_reviews;
DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON public.business_reviews;
DROP POLICY IF EXISTS "Anyone can view active businesses with location" ON public.businesses;
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Public can view active staff" ON public.staff;
DROP POLICY IF EXISTS "Business owners can view their staff" ON public.staff;
DROP POLICY IF EXISTS "Business owners can create staff" ON public.staff;
DROP POLICY IF EXISTS "Business owners can update their staff" ON public.staff;
DROP POLICY IF EXISTS "Business owners can delete their staff" ON public.staff;
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Business owners can manage their payment methods" ON public.payment_methods;

-- Enable RLS on all tables (will skip if already enabled)
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies with unique names

-- Businesses table policies
CREATE POLICY "Secure_Business_owners_can_manage_their_businesses"
  ON public.businesses
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Secure_Public_can_view_active_businesses"
  ON public.businesses
  FOR SELECT
  USING (is_active = true);

-- Business settings policies
CREATE POLICY "Secure_Business_owners_can_manage_their_settings"
  ON public.business_settings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Services policies
CREATE POLICY "Secure_Business_owners_can_manage_their_services"
  ON public.services
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Secure_Public_can_view_active_services"
  ON public.services
  FOR SELECT
  USING (is_active = true);

-- Staff policies
CREATE POLICY "Secure_Business_owners_can_manage_their_staff"
  ON public.staff
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Secure_Public_can_view_active_staff"
  ON public.staff
  FOR SELECT
  USING (is_active = true);

-- Clients policies
CREATE POLICY "Secure_Business_owners_can_manage_their_clients"
  ON public.clients
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Secure_Business_owners_can_manage_their_bookings"
  ON public.bookings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Secure_Clients_can_view_their_bookings_by_email"
  ON public.bookings
  FOR SELECT
  USING (
    customer_email = auth.email() OR
    client_id IN (
      SELECT id FROM public.clients WHERE email = auth.email()
    )
  );

-- Blocked time slots policies
CREATE POLICY "Secure_Business_owners_can_manage_blocked_time_slots"
  ON public.blocked_time_slots
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Secure_Public_can_view_blocked_slots_for_booking_validation"
  ON public.blocked_time_slots
  FOR SELECT
  USING (true);

-- Invoices policies
CREATE POLICY "Secure_Business_owners_can_manage_their_invoices"
  ON public.invoices
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Invoice items policies
CREATE POLICY "Secure_Business_owners_can_manage_their_invoice_items"
  ON public.invoice_items
  FOR ALL
  USING (
    invoice_id IN (
      SELECT id FROM public.invoices 
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM public.invoices 
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
      )
    )
  );

-- Payment transactions policies (read-only for business owners)
CREATE POLICY "Secure_Business_owners_view_payment_transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Business payment settings policies
CREATE POLICY "Secure_Business_owners_can_manage_their_payment_settings"
  ON public.business_payment_settings
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Payment methods policies
CREATE POLICY "Secure_Business_owners_can_manage_their_payment_methods"
  ON public.payment_methods
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Secure_Anyone_can_view_active_payment_methods"
  ON public.payment_methods
  FOR SELECT
  USING (is_active = true);

-- Business reviews policies
CREATE POLICY "Secure_Anyone_can_view_business_reviews"
  ON public.business_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Secure_Authenticated_users_can_create_reviews"
  ON public.business_reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Notification log policies
CREATE POLICY "Secure_Business_owners_can_view_their_notification_logs"
  ON public.notification_log
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Staff attendance policies
CREATE POLICY "Secure_Business_owners_can_manage_staff_attendance"
  ON public.staff_attendance
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Profiles policies
CREATE POLICY "Secure_Users_can_manage_their_own_profile"
  ON public.profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Secure_Users_can_view_their_own_subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Secure_Users_can_manage_their_own_subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User roles policies
CREATE POLICY "Secure_Users_can_view_their_own_roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Secure_Admins_can_manage_all_roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subscription discounts policies (admin only)
CREATE POLICY "Secure_Admins_can_manage_subscription_discounts"
  ON public.subscription_discounts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Secure_Anyone_can_view_subscription_discounts"
  ON public.subscription_discounts
  FOR SELECT
  USING (true);

-- Create security functions for business validation
CREATE OR REPLACE FUNCTION public.validate_business_ownership(business_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND user_id = auth.uid()
  );
$$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies (admin only)
CREATE POLICY "Secure_Admins_can_view_audit_logs"
  ON public.audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
