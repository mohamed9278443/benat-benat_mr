import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link, X, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUpload: (url: string) => void;
  onVideoRemove?: () => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  currentVideoUrl,
  onVideoUpload,
  onVideoRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<void> => {
    setIsUploading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('يرجى اختيار ملف فيديو صالح');
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('حجم الفيديو كبير جداً. الحد الأقصى 50 ميجابايت');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);

      onVideoUpload(data.publicUrl);
      
      toast({
        title: "تم رفع الفيديو بنجاح",
        description: "تم رفع الفيديو وحفظه بنجاح",
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: "خطأ في رفع الفيديو",
        description: error.message || "حدث خطأ أثناء رفع الفيديو",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      uploadVideo(file);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadVideo(file);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (videoUrl.trim()) {
      onVideoUpload(videoUrl.trim());
      setVideoUrl('');
      toast({
        title: "تم إضافة الفيديو",
        description: "تم إضافة رابط الفيديو بنجاح",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">فيديو المنتج</Label>
      
      {currentVideoUrl ? (
        <div className="relative">
          <video
            src={currentVideoUrl}
            controls
            className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-border shadow-sm"
          >
            متصفحك لا يدعم تشغيل الفيديو
          </video>
          {onVideoRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onVideoRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-2">
            <Film className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {isUploading ? 'جاري رفع الفيديو...' : 'اسحب الفيديو هنا أو انقر للاختيار'}
            </div>
            <div className="text-xs text-muted-foreground">
              MP4, AVI, MOV (حتى 50 ميجابايت)
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm">أو أدخل رابط الفيديو</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={!videoUrl.trim() || isUploading}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!currentVideoUrl && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'جاري الرفع...' : 'رفع فيديو من الجهاز'}
        </Button>
      )}
    </div>
  );
};