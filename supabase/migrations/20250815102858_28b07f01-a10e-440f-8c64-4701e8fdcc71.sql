-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  setting_key text,
  setting_value text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
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