-- First, drop the existing public policy
DROP POLICY IF EXISTS "Everyone can view site settings" ON public.site_settings;

-- Create a function that returns only non-sensitive site settings for public access
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  setting_key text,
  setting_value text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    s.setting_key,
    s.setting_value
  FROM public.site_settings s
  WHERE s.setting_key IN (
    'site_name',
    'site_description', 
    'footer_text',
    'main_video_url'
  );
$$;

-- Create a new restrictive policy for public access
CREATE POLICY "Public can view non-sensitive site settings" 
ON public.site_settings 
FOR SELECT 
USING (
  setting_key IN (
    'site_name',
    'site_description',
    'footer_text', 
    'main_video_url'
  )
);

-- Keep the admin policy unchanged
-- (Admins can still manage all site settings)