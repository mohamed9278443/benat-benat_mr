-- Create audit logs table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin());

-- Enhanced audit logging function for orders
CREATE OR REPLACE FUNCTION public.log_order_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Get user email for logging
  SELECT email INTO current_user_email 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Log the access attempt
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    user_id,
    user_email,
    performed_at,
    details
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    current_user_email,
    now(),
    jsonb_build_object(
      'row_id', COALESCE(NEW.id, OLD.id),
      'triggered_by', 'RLS_access'
    )
  );
  
  -- Ensure proper user context
  IF auth.uid() IS NULL AND current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for order access logging
CREATE TRIGGER log_order_access_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_access();

-- Create function to log authentication attempts
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  attempt_type TEXT,
  success BOOLEAN,
  user_email TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    user_id,
    user_email,
    performed_at,
    details
  ) VALUES (
    'auth_attempts',
    attempt_type,
    auth.uid(),
    user_email,
    now(),
    jsonb_build_object(
      'success', success,
      'attempt_details', details
    )
  );
END;
$$;