-- Create a unified function that handles permissions internally and prevents caching
CREATE OR REPLACE FUNCTION public.get_site_settings_with_permissions()
RETURNS TABLE(setting_key text, setting_value text)
LANGUAGE sql
VOLATILE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    s.setting_key,
    s.setting_value
  FROM public.site_settings s
  WHERE 
    CASE 
      WHEN public.is_admin() THEN true
      ELSE s.setting_key IN (
        'site_name',
        'site_description', 
        'footer_text',
        'main_video_url'
      )
    END;
$function$