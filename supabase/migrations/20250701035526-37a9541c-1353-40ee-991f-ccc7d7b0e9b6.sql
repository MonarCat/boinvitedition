
-- Fix the subscription table constraint for proper upserts
-- Add unique constraint on user_id, business_id combination
ALTER TABLE public.subscriptions 
ADD CONSTRAINT unique_user_business_subscription 
UNIQUE (user_id, business_id);

-- Also add individual indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_business 
ON public.subscriptions(user_id, business_id);
