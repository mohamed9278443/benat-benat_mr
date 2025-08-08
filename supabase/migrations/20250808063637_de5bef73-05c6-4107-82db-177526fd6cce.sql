-- Insert initial categories with images
INSERT INTO public.categories (id, name, name_en, image_url, display_order, is_active) VALUES
('f1e2d3c4-b5a6-9788-1234-567890abcdef', 'ملحف', 'Melhaf', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop', 1, true),
('a2b3c4d5-e6f7-8901-2345-678901bcdefg', 'حقائب', 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop', 2, true),
('b3c4d5e6-f7g8-9012-3456-789012cdefgh', 'فساتين', 'Dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop', 3, true),
('c4d5e6f7-g8h9-0123-4567-890123defghi', 'عطور', 'Perfumes', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=600&fit=crop', 4, true);

-- Insert site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('whatsapp_number', '+22236123456'),
('site_email', 'info@banat.mr'),
('main_video_url', 'https://youtu.be/_AufUbQhYb4'),
('site_name', 'بنات - Banat'),
('site_description', 'متجر بنات للأزياء النسائية العصرية في موريتانيا'),
('footer_text', 'نقدم لك أجمل الأزياء النسائية العصرية والتقليدية'),
('contact_address', 'نواكشوط، موريتانيا'),
('map_link', 'https://maps.google.com/?q=Nouakchott,Mauritania');

-- Insert sample products for each category
-- Melhaf products
INSERT INTO public.products (id, name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
('p1m1-2345-6789-abcd-ef1234567890', 'ملحف أنيق باللون الأزرق', 'ملحف تقليدي موريتاني بتصميم عصري وألوان جذابة، مصنوع من أجود الخامات', 150.00, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop', 'f1e2d3c4-b5a6-9788-1234-567890abcdef', 'ملحف', true, true, 4.5, 23),
('p2m2-3456-789a-bcde-f12345678901', 'ملحف فاخر بالذهبي', 'ملحف راقي بتطريز ذهبي يناسب المناسبات الخاصة والأعراس', 250.00, 'https://images.unsplash.com/photo-1583846112755-54c978de8d41?w=600&h=800&fit=crop', 'f1e2d3c4-b5a6-9788-1234-567890abcdef', 'ملحف', false, true, 4.8, 15),
('p3m3-4567-89ab-cdef-123456789012', 'ملحف كاجوال يومي', 'ملحف مريح ومناسب للاستخدام اليومي بألوان هادئة', 120.00, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop', 'f1e2d3c4-b5a6-9788-1234-567890abcdef', 'ملحف', false, true, 4.2, 31);

-- Bags products
INSERT INTO public.products (id, name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
('p1b1-5678-9abc-def1-234567890123', 'حقيبة يد عصرية', 'حقيبة يد أنيقة مصنوعة من الجلد الطبيعي بتصميم عصري', 95.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 'a2b3c4d5-e6f7-8901-2345-678901bcdefg', 'حقائب', true, true, 4.6, 18),
('p2b2-6789-abcd-ef12-345678901234', 'حقيبة ظهر للعمل', 'حقيبة ظهر عملية ومريحة مناسبة للعمل والجامعة', 75.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&bg=brown', 'a2b3c4d5-e6f7-8901-2345-678901bcdefg', 'حقائب', false, true, 4.3, 27),
('p3b3-789a-bcde-f123-456789012345', 'حقيبة سهرة فاخرة', 'حقيبة سهرة صغيرة بتصميم راقي ومطرزة بالخرز', 140.00, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=800&fit=crop', 'a2b3c4d5-e6f7-8901-2345-678901bcdefg', 'حقائب', false, true, 4.7, 12);

-- Dresses products
INSERT INTO public.products (id, name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
('p1d1-89ab-cdef-1234-56789012345', 'فستان سهرة أحمر', 'فستان سهرة طويل باللون الأحمر مع تفاصيل أنيقة', 200.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', 'b3c4d5e6-f7g8-9012-3456-789012cdefgh', 'فساتين', true, true, 4.4, 22),
('p2d2-9abc-def1-2345-6789012345', 'فستان كاجوال صيفي', 'فستان خفيف وقصير مناسب للصيف والخروجات اليومية', 85.00, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', 'b3c4d5e6-f7g8-9012-3456-789012cdefgh', 'فساتين', false, true, 4.1, 35),
('p3d3-abcd-ef12-3456-789012345', 'فستان رسمي للعمل', 'فستان رسمي أنيق مناسب للعمل والمناسبات الرسمية', 165.00, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop', 'b3c4d5e6-f7g8-9012-3456-789012cdefgh', 'فساتين', false, true, 4.5, 19);

-- Perfumes products
INSERT INTO public.products (id, name, description, price, image_url, category_id, category, is_featured, is_active, rating, rating_count) VALUES
('p1p1-bcde-f123-4567-89012345', 'عطر ورد دمشقي', 'عطر فاخر برائحة الورد الدمشقي الأصيل، يدوم طويلاً', 180.00, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=800&fit=crop', 'c4d5e6f7-g8h9-0123-4567-890123defghi', 'عطور', true, true, 4.9, 45),
('p2p2-cdef-1234-5678-90123456', 'عطر العود الكمبودي', 'عطر العود الطبيعي بجودة عالية ورائحة مميزة', 320.00, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop', 'c4d5e6f7-g8h9-0123-4567-890123defghi', 'عطور', false, true, 4.8, 28),
('p3p3-def1-2345-6789-01234567', 'عطر زهر البرتقال', 'عطر منعش برائحة زهر البرتقال، مثالي للاستخدام اليومي', 95.00, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop', 'c4d5e6f7-g8h9-0123-4567-890123defghi', 'عطور', false, true, 4.3, 33);