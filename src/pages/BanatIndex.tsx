import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Search, MapPin, Phone, Mail, Edit, Plus } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { CartIcon } from '@/components/CartIcon';
import { CategoryCard } from '@/components/CategoryCard';
import { MainVideo } from '@/components/MainVideo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCategories } from '@/hooks/useCategories';
import { CategoryManagementDialog } from '@/components/CategoryManagementDialog';
import { ProductManagementDialog } from '@/components/ProductManagementDialog';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_featured: boolean;
  rating: number;
  rating_count: number;
}

const BanatIndex = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();

  useEffect(() => {
    checkUser();
    fetchProducts();
    
    // Real-time subscriptions for categories and products
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
      }, () => {
        refetchCategories();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkIfAdmin(session.user);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      setTimeout(() => {
        checkIfAdmin(user);
      }, 0);
    }
  };

  const checkIfAdmin = async (user: any) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(profileData?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'نجح تسجيل الدخول',
        description: 'تم تسجيل الدخول بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل الخروج بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = () => {
    console.log('Add category clicked');
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    console.log('Edit category clicked:', category);
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleAddProduct = () => {
    console.log('Add product clicked');
    setIsProductDialogOpen(true);
  };

  const handleCategoryDialogSuccess = () => {
    refetchCategories();
    toast({
      title: 'نجح العمل',
      description: 'تم حفظ الفئة بنجاح',
    });
  };

  const handleProductDialogSuccess = () => {
    fetchProducts();
    toast({
      title: 'نجح العمل',
      description: 'تم حفظ المنتج بنجاح',
    });
  };

  if (loading || categoriesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Right side - User actions */}
            <div className="flex items-center gap-4">
              <CartIcon />
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                        الإدارة
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={signOut}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    تسجيل خروج
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                    <User className="h-4 w-4 mr-2" />
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>

            {/* Center - Logo */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{settings.site_name_ar || 'بنات'}</h1>
              <p className="text-sm opacity-90">{settings.site_name_en || 'Banat'}</p>
            </div>

            {/* Left side - Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="البحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            مرحباً بكم في متجر {settings.site_name_ar || 'بنات'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            أجمل الملابس النسائية والحقائب والعطور للسوق الموريتاني
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="#categories">تصفح المنتجات</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/cart">سلة المشتريات</Link>
            </Button>
            {isAdmin && (
              <Button variant="secondary" size="lg" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">الفئات الرئيسية</h2>
            {isAdmin && (
              <Button className="gap-2" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
                إضافة فئة
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isAdmin={isAdmin}
                onEdit={handleEditCategory}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Video Section */}
      {settings.main_video_url && (
        <section className="py-12 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">فيديو توضيحي</h2>
              <p className="text-muted-foreground">تعرفي أكثر على منتجاتنا</p>
            </div>
            
            <div className="mt-8">
              <MainVideo 
                videoUrl={settings.main_video_url} 
                className="mx-auto"
              />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">معلومات التواصل</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{settings.whatsapp_number || '+222 49055137'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{settings.email || 'moubarakouhoussein@gmail.com'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <a 
                    href={settings.location_url || 'https://maps.app.goo.gl/vE3k4Ts1shPzQmNd7'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    الموقع الجغرافي
                  </a>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{settings.site_name_ar || 'بنات'}</h2>
              <p className="text-muted-foreground">{settings.site_name_en || 'Banat'}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">روابط سريعة</h3>
              <div className="space-y-2">
                <div><Link to="/" className="text-muted-foreground hover:text-primary">الرئيسية</Link></div>
                <div><Link to="/cart" className="text-muted-foreground hover:text-primary">سلة المشتريات</Link></div>
                <div><Link to="/auth" className="text-muted-foreground hover:text-primary">تسجيل الدخول</Link></div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2025 متجر {settings.site_name_ar || 'بنات'}/{settings.site_name_en || 'Banat'}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        category={editingCategory}
        onSuccess={handleCategoryDialogSuccess}
      />

      {/* Product Management Dialog */}
      <ProductManagementDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        product={null}
        categories={categories}
        onSuccess={handleProductDialogSuccess}
      />
    </div>
  );
};

export default BanatIndex;