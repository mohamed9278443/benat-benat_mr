import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Upload, Link as LinkIcon } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { VideoUpload } from '@/components/VideoUpload';

interface SiteSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SiteSettingsDialog: React.FC<SiteSettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { settings, updateSetting, loading, refetch } = useSiteSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    site_name_ar: '',
    site_name_en: '',
    site_description: '',
    footer_text: '',
    whatsapp_number: '',
    site_email: '',
    contact_address: '',
    map_link: '',
    main_video_url: ''
  });

  useEffect(() => {
    if (settings && !loading) {
      setFormData({
        site_name_ar: settings.site_name_ar || '',
        site_name_en: settings.site_name_en || '',
        site_description: settings.site_description || '',
        footer_text: settings.footer_text || '',
        whatsapp_number: settings.whatsapp_number || '',
        site_email: settings.site_email || '',
        contact_address: settings.contact_address || '',
        map_link: settings.map_link || '',
        main_video_url: settings.main_video_url || ''
      });
    }
  }, [settings, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update all form fields
      const promises = Object.entries(formData).map(([key, value]) =>
        updateSetting(key, value)
      );
      
      const results = await Promise.all(promises);
      
      // Check if all updates succeeded
      if (results.every(result => result)) {
        // Force refetch to update all components immediately
        await refetch();
        
        toast({
          title: "تم الحفظ",
          description: "تم حفظ إعدادات الموقع بنجاح"
        });
        
        onOpenChange(false);
      } else {
        throw new Error('Some settings failed to update');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إعدادات الموقع</DialogTitle>
          <DialogDescription>
            قم بتحديث إعدادات الموقع العامة
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name_ar">اسم الموقع (بالعربية)</Label>
              <Input
                id="site_name_ar"
                value={formData.site_name_ar}
                onChange={(e) => setFormData({ ...formData, site_name_ar: e.target.value })}
                placeholder="بنات"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_name_en">اسم الموقع (بالإنجليزية)</Label>
              <Input
                id="site_name_en"
                value={formData.site_name_en}
                onChange={(e) => setFormData({ ...formData, site_name_en: e.target.value })}
                placeholder="BANAT"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">رقم الواتساب</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+22236123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_email">البريد الإلكتروني</Label>
              <Input
                id="site_email"
                type="email"
                value={formData.site_email}
                onChange={(e) => setFormData({ ...formData, site_email: e.target.value })}
                placeholder="info@banat.mr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_address">العنوان</Label>
              <Input
                id="contact_address"
                value={formData.contact_address}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                placeholder="نواكشوط، موريتانيا"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">وصف الموقع</Label>
            <Textarea
              id="site_description"
              value={formData.site_description}
              onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
              placeholder="متجر بنات للأزياء النسائية العصرية في موريتانيا"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_text">نص الفوتر</Label>
            <Textarea
              id="footer_text"
              value={formData.footer_text}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              placeholder="نقدم لك أجمل الأزياء النسائية العصرية والتقليدية"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>الفيديو الرئيسي</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">رابط فيديو</TabsTrigger>
                <TabsTrigger value="upload">رفع فيديو</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-2">
                <Label htmlFor="main_video_url">رابط الفيديو (يوتيوب، تيك توك، فيسبوك)</Label>
                <Input
                  id="main_video_url"
                  type="url"
                  value={formData.main_video_url}
                  onChange={(e) => setFormData({ ...formData, main_video_url: e.target.value })}
                  placeholder="https://youtu.be/... أو https://tiktok.com/... أو https://facebook.com/watch/..."
                />
              </TabsContent>
              <TabsContent value="upload">
                <VideoUpload
                  currentVideoUrl={formData.main_video_url}
                  onVideoUpload={(url) => setFormData({ ...formData, main_video_url: url })}
                  onVideoRemove={() => setFormData({ ...formData, main_video_url: '' })}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="map_link">رابط الخريطة</Label>
            <Input
              id="map_link"
              type="url"
              value={formData.map_link}
              onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
              placeholder="https://maps.google.com/?q=Nouakchott,Mauritania"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
