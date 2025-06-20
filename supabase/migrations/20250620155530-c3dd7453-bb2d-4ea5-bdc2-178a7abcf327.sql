
-- Create business_payment_settings table
CREATE TABLE public.business_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  require_payment BOOLEAN NOT NULL DEFAULT false,
  paystack_public_key TEXT,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Add Row Level Security
ALTER TABLE public.business_payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for business owners to manage their payment settings
CREATE POLICY "Business owners can view their payment settings" 
  ON public.business_payment_settings 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert their payment settings" 
  ON public.business_payment_settings 
  FOR INSERT 
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their payment settings" 
  ON public.business_payment_settings 
  FOR UPDATE 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_business_payment_settings_updated_at
  BEFORE UPDATE ON public.business_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
