
-- Fix the payment security function with correct syntax
CREATE OR REPLACE FUNCTION public.validate_payment_security(_amount NUMERIC, _business_id UUID, _metadata JSONB DEFAULT '{}')
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  _result JSONB := '{"valid": true, "warnings": []}'::JSONB;
  _warnings TEXT[] := ARRAY[]::TEXT[];
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  
  -- Check for suspicious large amounts
  IF _amount > 100000 THEN
    _warnings := array_append(_warnings, 'Large payment amount detected');
    
    -- Log high-value transaction
    INSERT INTO public.audit_log (action, table_name, old_values, new_values, user_id)
    VALUES (
      'SECURITY_EVENT',
      'HIGH_VALUE_PAYMENT',
      jsonb_build_object('amount', _amount, 'business_id', _business_id),
      _metadata,
      _user_id
    );
  END IF;
  
  -- Check payment frequency (more than 10 payments in last hour)
  IF EXISTS (
    SELECT 1 FROM public.payment_transactions 
    WHERE business_id = _business_id 
    AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY business_id
    HAVING COUNT(*) > 10
  ) THEN
    _warnings := array_append(_warnings, 'High payment frequency detected');
    
    INSERT INTO public.audit_log (action, table_name, old_values, new_values, user_id)
    VALUES (
      'SECURITY_EVENT',
      'HIGH_PAYMENT_FREQUENCY',
      jsonb_build_object('business_id', _business_id, 'amount', _amount),
      _metadata,
      _user_id
    );
  END IF;
  
  -- Update result with warnings (fixed parenthesis)
  IF array_length(_warnings, 1) > 0 THEN
    _result := jsonb_set(_result, '{warnings}', to_jsonb(_warnings));
  END IF;
  
  RETURN _result;
END;
$$;
