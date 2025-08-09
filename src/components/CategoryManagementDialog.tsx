import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ImageUpload';

interface Category {
  id?: string;
  name: string;
  name_en?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

export const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    name_en: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        name_en: category.name_en || '',
        image_url: category.image_url,
        display_order: category.display_order,
        is_active: category.is_active
      });
    } else {
      setFormData({
        name: '',
        name_en: '',
        image_url: '',
        display_order: 0,
        is_active: true
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category?.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            name_en: formData.name_en,
            image_url: formData.image_url,
            display_order: formData.display_order,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث الفئة بنجاح',
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            name_en: formData.name_en,
            image_url: formData.image_url,
            display_order: formData.display_order,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: 'تم الإنشاء بنجاح',
          description: 'تم إنشاء الفئة بنجاح',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حفظ الفئة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'قم بتعديل بيانات الفئة' : 'أدخل بيانات الفئة الجديدة'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم الفئة (بالعربية) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: ملابس نسائية"
              required
            />
          </div>

          <div>
            <Label htmlFor="name_en">اسم الفئة (بالإنجليزية)</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder="Example: Women's Clothing"
            />
          </div>

          <div>
            <Label htmlFor="display_order">ترتيب العرض</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label>صورة الفئة *</Label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={formData.image_url}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">فئة نشطة</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.image_url}
              className="flex-1"
            >
              {loading ? 'جاري الحفظ...' : (category ? 'تحديث' : 'إضافة')}
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