
-- Add missing paystack_reference column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS paystack_reference TEXT;

-- Add index for better performance on paystack_reference lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_reference 
ON public.subscriptions(paystack_reference);
