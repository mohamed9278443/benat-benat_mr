-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table for admin configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update products table for new structure
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Everyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Site settings policies
CREATE POLICY "Everyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (name, name_en, image_url, display_order) VALUES
('ملحف', 'Melhef', 'https://i.postimg.cc/DzDqjCwx/alalalia-white-100-002-039-alt3-sq-gy-2000x2000.jpg', 1),
('حقائب', 'Bags', 'https://i.postimg.cc/Hk605WDD/attar-bottle-manufacturer-300x300.jpg', 2),
('فساتين', 'Dresses', 'https://i.postimg.cc/CxhHzB2s/FB-IMG-1674512139138-1-1.jpg', 3),
('عطور', 'Perfumes', 'https://i.postimg.cc/mrhYSxBc/IMG-20250612-WA0019.jpg', 4);

-- Insert initial site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('site_name_ar', 'بنات'),
('site_name_en', 'Banat'),
('whatsapp_number', '+222 49055137'),
('email', 'moubarakouhoussein@gmail.com'),
('location_url', 'https://maps.app.goo.gl/vE3k4Ts1shPzQmNd7'),
('main_video_url', 'https://youtu.be/K06DUDGkDFc?si=-xhRsWl6-iKyBPMs'),
('primary_color', '#d11e72'),
('currency', 'أوقية موريتانية');
