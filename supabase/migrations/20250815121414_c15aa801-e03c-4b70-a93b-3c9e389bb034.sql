-- Enable replica identity for site_settings table to support real-time updates
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;