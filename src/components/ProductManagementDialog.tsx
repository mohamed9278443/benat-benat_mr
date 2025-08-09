import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { VideoUpload } from '@/components/VideoUpload';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url?: string;
  product_link?: string;
  category_id: string;
  is_featured: boolean;
  is_active: boolean;
  rating?: number;
  rating_count?: number;
}

interface Category {
  id: string;
  name: string;
}

interface ProductManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export const ProductManagementDialog: React.FC<ProductManagementDialogProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    video_url: '',
    product_link: '',
    category_id: '',
    is_featured: false,
    is_active: true,
    rating: 0,
    rating_count: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        video_url: product.video_url || '',
        product_link: product.product_link || '',
        category_id: product.category_id,
        is_featured: product.is_featured,
        is_active: product.is_active,
        rating: product.rating || 0,
        rating_count: product.rating_count || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        video_url: '',
        product_link: '',
        category_id: '',
        is_featured: false,
        is_active: true,
        rating: 0,
        rating_count: 0
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل');

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url,
            video_url: formData.video_url,
            product_link: formData.product_link,
            category_id: formData.category_id,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث المنتج بنجاح',
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url,
            video_url: formData.video_url,
            product_link: formData.product_link,
            category_id: formData.category_id,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
            created_by: user.id,
            rating: 0,
            rating_count: 0
          });

        if (error) throw error;

        toast({
          title: 'تم الإنشاء بنجاح',
          description: 'تم إنشاء المنتج بنجاح',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حفظ المنتج',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleVideoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, video_url: url }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'قم بتعديل بيانات المنتج' : 'أدخل بيانات المنتج الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: فستان صيفي أنيق"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">وصف المنتج</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف تفصيلي للمنتج..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">السعر (أوقية) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="category_id">الفئة *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="product_link">رابط المنتج (اختياري)</Label>
            <Input
              id="product_link"
              value={formData.product_link}
              onChange={(e) => setFormData(prev => ({ ...prev, product_link: e.target.value }))}
              placeholder="https://example.com/product"
            />
          </div>

          <div>
            <Label>صورة المنتج *</Label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={formData.image_url}
            />
          </div>

          <div>
            <Label>فيديو المنتج (اختياري)</Label>
            <VideoUpload
              onVideoUpload={handleVideoUpload}
              currentVideoUrl={formData.video_url}
            />
          </div>

          <div className="flex items-center space-x-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">منتج مميز</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">منتج نشط</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.image_url || !formData.category_id}
              className="flex-1"
            >
              {loading ? 'جاري الحفظ...' : (product ? 'تحديث' : 'إضافة')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};