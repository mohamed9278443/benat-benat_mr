import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ImageGallery } from '@/components/ImageGallery';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url?: string;
  product_link?: string;
  category: string;
  is_featured: boolean;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchProductImages();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async () => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order');

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
          <Button onClick={handleGoBack}>العودة</Button>
        </div>
      </div>
    );
  }

  // Combine main image with additional images
  const allImages = productImages.length > 0 
    ? productImages.map(img => img.image_url)
    : product.image_url 
      ? [product.image_url] 
      : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          العودة
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images and Video Section */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <ImageGallery 
              images={allImages}
              className="aspect-square"
            />
            
            {/* Video Player */}
            {product.video_url && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">فيديو المنتج</h3>
                <VideoPlayer 
                  src={product.video_url}
                  poster={product.image_url}
                  className="aspect-video"
                />
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.is_featured && (
                  <Badge variant="secondary">مميز</Badge>
                )}
              </div>
              
              {product.category && (
                <p className="text-muted-foreground mb-4">{product.category}</p>
              )}
              
              <p className="text-2xl font-bold text-primary mb-6">
                {product.price.toFixed(2)} ريال
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">وصف المنتج</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Link */}
            {product.product_link && (
              <div>
                <h3 className="text-lg font-semibold mb-2">رابط المنتج</h3>
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                >
                  <a 
                    href={product.product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    زيارة الرابط
                  </a>
                </Button>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {cartLoading ? 'جاري الإضافة...' : 'إضافة إلى السلة'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}