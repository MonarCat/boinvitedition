
-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policies for service images
CREATE POLICY "Public can view service images" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated users can upload service images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'service-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own service images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'service-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own service images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'service-images' AND
    auth.role() = 'authenticated'
  );

-- Add business payout account details to existing business_payouts table
ALTER TABLE business_payouts ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT;
ALTER TABLE business_payouts ADD COLUMN IF NOT EXISTS split_percentage NUMERIC DEFAULT 95.0;
ALTER TABLE business_payouts ADD COLUMN IF NOT EXISTS auto_split_enabled BOOLEAN DEFAULT false;

-- Update businesses table to track payment setup status
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS payment_setup_complete BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS paystack_subaccount_id TEXT;

-- Create business payment configurations table
CREATE TABLE IF NOT EXISTS business_payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('paystack_split', 'mpesa_direct', 'bank_transfer')),
  config_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for business payment configs
ALTER TABLE business_payment_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their payment configs" ON business_payment_configs
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Update payment_transactions table to track split payments
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS split_config JSONB;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS business_received_amount NUMERIC;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC DEFAULT 0;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_business_payment_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_payment_configs_updated_at
  BEFORE UPDATE ON business_payment_configs
  FOR EACH ROW EXECUTE FUNCTION update_business_payment_configs_updated_at();
