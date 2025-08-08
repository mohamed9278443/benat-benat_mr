-- Insert initial categories for Banat women's clothing store
INSERT INTO public.categories (name, name_en, image_url, display_order, is_active) VALUES
('ملحف', 'Melhaf', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 1, true),
('حقائب', 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 2, true),
('فساتين', 'Dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 3, true),
('عطور', 'Perfumes', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 4, true);

-- Insert site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('whatsapp_number', '+22222222222'),
('email', 'info@banat.mr'),
('main_video_url', 'https://youtu.be/_AufUbQhYb4'),
('site_name', 'بنات'),
('site_description', 'متجر الأزياء النسائية الأول في موريتانيا'),
('footer_text', 'بنات - أناقة وجمال بلا حدود');

-- Get category IDs for products (we'll use these in a separate migration)
-- First, let's create some sample products for each category
DO $$
DECLARE
    melhaf_id uuid;
    bags_id uuid;
    dresses_id uuid;
    perfumes_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO melhaf_id FROM categories WHERE name = 'ملحف';
    SELECT id INTO bags_id FROM categories WHERE name = 'حقائب';
    SELECT id INTO dresses_id FROM categories WHERE name = 'فساتين';
    SELECT id INTO perfumes_id FROM categories WHERE name = 'عطور';

    -- Insert sample products for ملحف (Melhaf)
    INSERT INTO public.products (name, description, price, category_id, category, image_url, is_featured, is_active, rating, rating_count) VALUES
    ('ملحف تقليدي أزرق', 'ملحف موريتاني تقليدي عالي الجودة باللون الأزرق الكلاسيكي', 25000, melhaf_id, 'ملحف', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.8, 156),
    ('ملحف عصري وردي', 'ملحف بتصميم عصري جميل باللون الوردي مع تطريز رقيق', 28000, melhaf_id, 'ملحف', 'https://images.unsplash.com/photo-1551418290-a64d6ac1b7c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.9, 203),
    ('ملحف فاخر ذهبي', 'ملحف فاخر بتطريز ذهبي للمناسبات الخاصة', 45000, melhaf_id, 'ملحف', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false, true, 4.7, 89);

    -- Insert sample products for حقائب (Bags)
    INSERT INTO public.products (name, description, price, category_id, category, image_url, is_featured, is_active, rating, rating_count) VALUES
    ('حقيبة يد جلدية أنيقة', 'حقيبة يد من الجلد الطبيعي عالي الجودة بتصميم أنيق', 15000, bags_id, 'حقائب', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.6, 128),
    ('حقيبة ظهر عملية', 'حقيبة ظهر عصرية ومريحة للاستخدام اليومي', 12000, bags_id, 'حقائب', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false, true, 4.5, 94),
    ('حقيبة سهرة فاخرة', 'حقيبة سهرة صغيرة بتصميم فاخر للمناسبات الخاصة', 8500, bags_id, 'حقائب', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false, true, 4.8, 67);

    -- Insert sample products for فساتين (Dresses)
    INSERT INTO public.products (name, description, price, category_id, category, image_url, is_featured, is_active, rating, rating_count) VALUES
    ('فستان سهرة أنيق', 'فستان سهرة طويل بتصميم أنيق مناسب للمناسبات الخاصة', 35000, dresses_id, 'فساتين', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.9, 245),
    ('فستان كاجوال يومي', 'فستان كاجوال مريح للارتداء اليومي بألوان زاهية', 18000, dresses_id, 'فساتين', 'https://images.unsplash.com/photo-1566479179817-c0efe153eff1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false, true, 4.4, 156),
    ('فستان زفاف فاخر', 'فستان زفاف أبيض فاخر بتفاصيل راقية', 85000, dresses_id, 'فساتين', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 5.0, 78);

    -- Insert sample products for عطور (Perfumes)
    INSERT INTO public.products (name, description, price, category_id, category, image_url, is_featured, is_active, rating, rating_count) VALUES
    ('عطر زهور الياسمين', 'عطر نسائي فاخر برائحة زهور الياسمين الطبيعية', 7500, perfumes_id, 'عطور', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.7, 189),
    ('عطر الورد الدمشقي', 'عطر كلاسيكي برائحة الورد الدمشقي الأصيل', 9000, perfumes_id, 'عطور', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false, true, 4.8, 134),
    ('عطر العود الملكي', 'عطر شرقي فاخر برائحة العود الطبيعي', 12000, perfumes_id, 'عطور', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, true, 4.9, 98);
END $$;