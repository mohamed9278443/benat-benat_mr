-- Insert initial categories with proper UUIDs
INSERT INTO public.categories (name, name_en, image_url, display_order, is_active) VALUES
('ملحف', 'Melhaf', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop', 1, true),
('حقائب', 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop', 2, true),
('فساتين', 'Dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop', 3, true),
('عطور', 'Perfumes', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=600&fit=crop', 4, true);

-- Insert site settings (will only insert new ones)
INSERT INTO public.site_settings (setting_key, setting_value) 
SELECT * FROM (VALUES
('whatsapp_number', '+22236123456'),
('site_email', 'info@banat.mr'),
('main_video_url', 'https://youtu.be/_AufUbQhYb4'),
('site_name', 'بنات - Banat'),
('site_description', 'متجر بنات للأزياء النسائية العصرية في موريتانيا'),
('footer_text', 'نقدم لك أجمل الأزياء النسائية العصرية والتقليدية'),
('contact_address', 'نواكشوط، موريتانيا'),
('map_link', 'https://maps.google.com/?q=Nouakchott,Mauritania')
) AS tmp(setting_key, setting_value)
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_settings WHERE site_settings.setting_key = tmp.setting_key
);

-- Get category IDs for products
DO $$ 
DECLARE
    melhaf_id uuid;
    bags_id uuid;
    dresses_id uuid;
    perfumes_id uuid;
BEGIN
    SELECT id INTO melhaf_id FROM categories WHERE name = 'ملحف';
    SELECT id INTO bags_id FROM categories WHERE name = 'حقائب';
    SELECT id INTO dresses_id FROM categories WHERE name = 'فساتين';
    SELECT id INTO perfumes_id FROM categories WHERE name = 'عطور';

    -- Insert sample products for Melhaf
    INSERT INTO public.products (name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
    ('ملحف أنيق باللون الأزرق', 'ملحف تقليدي موريتاني بتصميم عصري وألوان جذابة، مصنوع من أجود الخامات', 150.00, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop', melhaf_id, 'ملحف', true, true, 4.5, 23),
    ('ملحف فاخر بالذهبي', 'ملحف راقي بتطريز ذهبي يناسب المناسبات الخاصة والأعراس', 250.00, 'https://images.unsplash.com/photo-1583846112755-54c978de8d41?w=600&h=800&fit=crop', melhaf_id, 'ملحف', false, true, 4.8, 15),
    ('ملحف كاجوال يومي', 'ملحف مريح ومناسب للاستخدام اليومي بألوان هادئة', 120.00, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop', melhaf_id, 'ملحف', false, true, 4.2, 31);

    -- Insert sample products for Bags
    INSERT INTO public.products (name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
    ('حقيبة يد عصرية', 'حقيبة يد أنيقة مصنوعة من الجلد الطبيعي بتصميم عصري', 95.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', bags_id, 'حقائب', true, true, 4.6, 18),
    ('حقيبة ظهر للعمل', 'حقيبة ظهر عملية ومريحة مناسبة للعمل والجامعة', 75.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&bg=brown', bags_id, 'حقائب', false, true, 4.3, 27),
    ('حقيبة سهرة فاخرة', 'حقيبة سهرة صغيرة بتصميم راقي ومطرزة بالخرز', 140.00, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=800&fit=crop', bags_id, 'حقائب', false, true, 4.7, 12);

    -- Insert sample products for Dresses
    INSERT INTO public.products (name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
    ('فستان سهرة أحمر', 'فستان سهرة طويل باللون الأحمر مع تفاصيل أنيقة', 200.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', dresses_id, 'فساتين', true, true, 4.4, 22),
    ('فستان كاجوال صيفي', 'فستان خفيف وقصير مناسب للصيف والخروجات اليومية', 85.00, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', dresses_id, 'فساتين', false, true, 4.1, 35),
    ('فستان رسمي للعمل', 'فستان رسمي أنيق مناسب للعمل والمناسبات الرسمية', 165.00, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop', dresses_id, 'فساتين', false, true, 4.5, 19);

    -- Insert sample products for Perfumes
    INSERT INTO public.products (name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
    ('عطر ورد دمشقي', 'عطر فاخر برائحة الورد الدمشقي الأصيل، يدوم طويلاً', 180.00, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=800&fit=crop', perfumes_id, 'عطور', true, true, 4.9, 45),
    ('عطر العود الكمبودي', 'عطر العود الطبيعي بجودة عالية ورائحة مميزة', 320.00, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop', perfumes_id, 'عطور', false, true, 4.8, 28),
    ('عطر زهر البرتقال', 'عطر منعش برائحة زهر البرتقال، مثالي للاستخدام اليومي', 95.00, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop', perfumes_id, 'عطور', false, true, 4.3, 33);
END $$;