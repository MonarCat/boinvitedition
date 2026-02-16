-- Migration: Add Bolt-style commission model with platform balance tracking
-- This migration implements a commission-based payment model where:
-- 1. Clients pay businesses directly
-- 2. Platform fee accumulates as unpaid balance
-- 3. Businesses must clear balance to continue accepting bookings

-- ========================================
-- PART 1: Add columns to businesses table
-- ========================================

-- Add platform fee tracking columns to businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS platform_fee_percentage NUMERIC DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS platform_balance NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'restricted', 'suspended')),
ADD COLUMN IF NOT EXISTS last_platform_payment_date TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.businesses.platform_fee_percentage IS 'Percentage fee charged on each completed transaction (default 3%)';
COMMENT ON COLUMN public.businesses.platform_balance IS 'Accumulated unpaid platform fees';
COMMENT ON COLUMN public.businesses.account_status IS 'Account status: active, restricted (over threshold), or suspended';
COMMENT ON COLUMN public.businesses.last_platform_payment_date IS 'Last time business cleared platform balance';

-- ========================================
-- PART 2: Add subscription fields for hybrid model
-- ========================================

-- Add monthly base fee for hybrid subscription model
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS monthly_base_fee NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS subscription_balance_due NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS payment_interval TEXT DEFAULT 'monthly' CHECK (payment_interval IN ('monthly', 'commission', 'hybrid'));

-- Add comments
COMMENT ON COLUMN public.subscriptions.monthly_base_fee IS 'Fixed monthly subscription fee (for hybrid model)';
COMMENT ON COLUMN public.subscriptions.subscription_balance_due IS 'Accumulated unpaid subscription fees';
COMMENT ON COLUMN public.subscriptions.payment_interval IS 'Payment model: monthly (fixed), commission (%), or hybrid (both)';

-- ========================================
-- PART 3: Create platform_transactions table
-- ========================================

-- Track individual platform fee transactions (commission on each booking)
CREATE TABLE IF NOT EXISTS public.platform_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  service_amount NUMERIC NOT NULL,
  platform_fee_amount NUMERIC NOT NULL,
  fee_percentage NUMERIC NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'waived')),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_transactions_business_id ON public.platform_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_status ON public.platform_transactions(status);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_booking_id ON public.platform_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_business_status ON public.platform_transactions(business_id, status);

-- Enable RLS
ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their own platform transactions
CREATE POLICY "Business owners can view their platform transactions" 
ON public.platform_transactions FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_transactions_updated_at
  BEFORE UPDATE ON public.platform_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 4: Create platform_payments table
-- ========================================

-- Track platform balance clearance payments
CREATE TABLE IF NOT EXISTS public.platform_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  platform_fee_paid NUMERIC DEFAULT 0.0,
  subscription_fee_paid NUMERIC DEFAULT 0.0,
  payment_method TEXT,
  paystack_reference TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_platform_payments_business_id ON public.platform_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON public.platform_payments(status);
CREATE INDEX IF NOT EXISTS idx_platform_payments_reference ON public.platform_payments(paystack_reference);

-- Enable RLS
ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their own platform payments
CREATE POLICY "Business owners can view their platform payments" 
ON public.platform_payments FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_payments_updated_at
  BEFORE UPDATE ON public.platform_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 5: Create function to calculate platform fee on booking completion
-- ========================================

CREATE OR REPLACE FUNCTION public.add_platform_fee_on_booking_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  business_fee_percentage NUMERIC;
  platform_fee NUMERIC;
BEGIN
  -- Only process when booking is marked as completed and wasn't completed before
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get the business platform fee percentage
    SELECT platform_fee_percentage INTO business_fee_percentage
    FROM public.businesses
    WHERE id = NEW.business_id;
    
    -- Calculate platform fee (e.g., 3% of amount)
    platform_fee := NEW.amount * (business_fee_percentage / 100);
    
    -- Insert platform transaction record
    INSERT INTO public.platform_transactions (
      business_id,
      booking_id,
      service_amount,
      platform_fee_amount,
      fee_percentage,
      status
    ) VALUES (
      NEW.business_id,
      NEW.id,
      NEW.amount,
      platform_fee,
      business_fee_percentage,
      'unpaid'
    );
    
    -- Update business platform balance
    UPDATE public.businesses
    SET platform_balance = platform_balance + platform_fee,
        updated_at = NOW()
    WHERE id = NEW.business_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS trigger_add_platform_fee_on_booking_completion ON public.bookings;
CREATE TRIGGER trigger_add_platform_fee_on_booking_completion
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.add_platform_fee_on_booking_completion();

-- ========================================
-- PART 6: Create function to check balance restrictions
-- ========================================

CREATE OR REPLACE FUNCTION public.check_platform_balance_restriction(
  p_business_id UUID
)
RETURNS TABLE (
  is_restricted BOOLEAN,
  platform_balance NUMERIC,
  subscription_balance NUMERIC,
  total_balance NUMERIC,
  threshold_amount NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_platform_balance NUMERIC;
  v_subscription_balance NUMERIC;
  v_total_balance NUMERIC;
  v_threshold NUMERIC := 5000; -- KES 5,000 threshold
  v_account_status TEXT;
BEGIN
  -- Get current balances
  SELECT 
    b.platform_balance,
    COALESCE(s.subscription_balance_due, 0),
    b.account_status
  INTO 
    v_platform_balance,
    v_subscription_balance,
    v_account_status
  FROM public.businesses b
  LEFT JOIN public.subscriptions s ON s.business_id = b.id
  WHERE b.id = p_business_id;
  
  v_total_balance := v_platform_balance + v_subscription_balance;
  
  RETURN QUERY
  SELECT 
    (v_total_balance >= v_threshold OR v_account_status = 'restricted') as is_restricted,
    v_platform_balance as platform_balance,
    v_subscription_balance as subscription_balance,
    v_total_balance as total_balance,
    v_threshold as threshold_amount,
    CASE
      WHEN v_total_balance >= v_threshold THEN
        'Your platform balance is KES ' || v_total_balance::TEXT || '. Clear your balance to continue accepting bookings.'
      WHEN v_total_balance >= (v_threshold * 0.4) THEN
        'Platform balance: KES ' || v_total_balance::TEXT || '. Consider clearing your balance soon.'
      ELSE
        'Your account is in good standing.'
    END as message;
END;
$$;

-- ========================================
-- PART 7: Create function to clear platform balance
-- ========================================

CREATE OR REPLACE FUNCTION public.clear_platform_balance(
  p_business_id UUID,
  p_amount_paid NUMERIC,
  p_paystack_reference TEXT,
  p_payment_method TEXT DEFAULT 'paystack'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_platform_balance NUMERIC;
  v_subscription_balance NUMERIC;
  v_total_balance NUMERIC;
  v_platform_fee_paid NUMERIC;
  v_subscription_fee_paid NUMERIC;
  v_payment_id UUID;
BEGIN
  -- Get current balances
  SELECT 
    b.platform_balance,
    COALESCE(s.subscription_balance_due, 0)
  INTO 
    v_platform_balance,
    v_subscription_balance
  FROM public.businesses b
  LEFT JOIN public.subscriptions s ON s.business_id = b.id
  WHERE b.id = p_business_id;
  
  v_total_balance := v_platform_balance + v_subscription_balance;
  
  -- Determine how much goes to platform fee vs subscription
  IF p_amount_paid >= v_total_balance THEN
    -- Full payment
    v_platform_fee_paid := v_platform_balance;
    v_subscription_fee_paid := v_subscription_balance;
  ELSE
    -- Partial payment - split proportionally
    IF v_total_balance > 0 THEN
      v_platform_fee_paid := p_amount_paid * (v_platform_balance / v_total_balance);
      v_subscription_fee_paid := p_amount_paid * (v_subscription_balance / v_total_balance);
    ELSE
      v_platform_fee_paid := 0;
      v_subscription_fee_paid := 0;
    END IF;
  END IF;
  
  -- Record the payment
  INSERT INTO public.platform_payments (
    business_id,
    amount,
    platform_fee_paid,
    subscription_fee_paid,
    payment_method,
    paystack_reference,
    status
  ) VALUES (
    p_business_id,
    p_amount_paid,
    v_platform_fee_paid,
    v_subscription_fee_paid,
    p_payment_method,
    p_paystack_reference,
    'completed'
  )
  RETURNING id INTO v_payment_id;
  
  -- Mark platform transactions as paid
  UPDATE public.platform_transactions
  SET 
    status = 'paid',
    paid_at = NOW(),
    payment_reference = p_paystack_reference,
    updated_at = NOW()
  WHERE business_id = p_business_id 
    AND status = 'unpaid';
  
  -- Update business balance
  UPDATE public.businesses
  SET 
    platform_balance = GREATEST(platform_balance - v_platform_fee_paid, 0),
    last_platform_payment_date = NOW(),
    account_status = CASE 
      WHEN (platform_balance - v_platform_fee_paid) < 5000 THEN 'active'
      ELSE account_status
    END,
    updated_at = NOW()
  WHERE id = p_business_id;
  
  -- Update subscription balance
  UPDATE public.subscriptions
  SET 
    subscription_balance_due = GREATEST(subscription_balance_due - v_subscription_fee_paid, 0),
    updated_at = NOW()
  WHERE business_id = p_business_id;
  
  RETURN v_payment_id;
END;
$$;

-- ========================================
-- PART 8: Update existing PAYG subscriptions to use new model
-- ========================================

-- Set default platform fee percentage for existing businesses
UPDATE public.businesses
SET platform_fee_percentage = 3.0
WHERE platform_fee_percentage IS NULL;

-- Set payment interval for existing PAYG subscriptions
UPDATE public.subscriptions
SET payment_interval = 'commission'
WHERE plan_type = 'payg' AND payment_interval IS NULL;

-- ========================================
-- PART 9: Add realtime subscriptions
-- ========================================

-- Enable realtime for platform transactions and payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_payments;
