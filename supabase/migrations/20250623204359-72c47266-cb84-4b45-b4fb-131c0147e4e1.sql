
-- Create table for business payout details
CREATE TABLE public.business_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  mpesa_number VARCHAR(15),
  airtel_number VARCHAR(15),
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  account_holder_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verification_code VARCHAR(6),
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id)
);

-- Enable RLS for business payouts
ALTER TABLE public.business_payouts ENABLE ROW LEVEL SECURITY;

-- Create policy for business owners to manage their payout settings
CREATE POLICY "Business owners can manage payout settings" 
  ON public.business_payouts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_payouts.business_id 
      AND user_id = auth.uid()
    )
  );

-- Create table for client-to-business transactions
CREATE TABLE public.client_business_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  client_phone TEXT,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  business_amount NUMERIC NOT NULL,
  payment_reference TEXT,
  paystack_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'completed', 'failed')),
  payout_reference TEXT,
  dispute_status TEXT DEFAULT 'none' CHECK (dispute_status IN ('none', 'flagged', 'resolved')),
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for client business transactions
ALTER TABLE public.client_business_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for businesses to view their transactions
CREATE POLICY "Business owners can view their transactions" 
  ON public.client_business_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = client_business_transactions.business_id 
      AND user_id = auth.uid()
    )
  );

-- Create policy for clients to view their transactions
CREATE POLICY "Clients can view their transactions" 
  ON public.client_business_transactions 
  FOR SELECT 
  USING (client_email = auth.email());

-- Create indexes for better performance
CREATE INDEX idx_business_payouts_business_id ON public.business_payouts(business_id);
CREATE INDEX idx_client_business_transactions_business_id ON public.client_business_transactions(business_id);
CREATE INDEX idx_client_business_transactions_client_email ON public.client_business_transactions(client_email);
CREATE INDEX idx_client_business_transactions_booking_id ON public.client_business_transactions(booking_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_payouts_updated_at 
  BEFORE UPDATE ON public.business_payouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_business_transactions_updated_at 
  BEFORE UPDATE ON public.client_business_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
