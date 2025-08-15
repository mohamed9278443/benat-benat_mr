-- Create a security definer function to check if user is admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Drop existing admin policies for orders table
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Create new admin policies using the security definer function
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also improve the user policies to be more explicit about authentication
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for admins only (in case needed for admin management)
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_admin());