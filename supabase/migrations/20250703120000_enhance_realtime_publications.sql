-- Enable real-time for missing tables by adding them to the publication
ALTER TABLE public.payment_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.client_business_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.staff REPLICA IDENTITY FULL;
ALTER TABLE public.staff_attendance REPLICA IDENTITY FULL;
ALTER TABLE public.admin_alerts REPLICA IDENTITY FULL;

-- Add the missing tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_business_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;
