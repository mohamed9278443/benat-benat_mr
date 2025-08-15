-- Add additional security measures for orders table

-- Create an audit log function for order access (optional but good practice)
CREATE OR REPLACE FUNCTION public.log_order_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- This could be extended to log access attempts
  -- For now, just ensure proper user context
  IF auth.uid() IS NULL AND current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add constraint to ensure user_id is never null for orders
-- (This prevents creating orders without proper user association)
ALTER TABLE public.orders 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure essential customer info is provided
ALTER TABLE public.orders 
ADD CONSTRAINT check_customer_email_format 
CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint for phone number format (basic validation)
ALTER TABLE public.orders 
ADD CONSTRAINT check_customer_phone_not_empty 
CHECK (LENGTH(TRIM(customer_phone)) > 0);

-- Add constraint for customer name
ALTER TABLE public.orders 
ADD CONSTRAINT check_customer_name_not_empty 
CHECK (LENGTH(TRIM(customer_name)) > 0);

-- Add constraint for shipping address
ALTER TABLE public.orders 
ADD CONSTRAINT check_shipping_address_not_empty 
CHECK (LENGTH(TRIM(shipping_address)) > 0);