import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import Footer from "@/components/Footer";
import { CategoryCard } from '@/components/CategoryCard';
import { MainVideo } from '@/components/MainVideo';
import Header from '@/components/Header';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCategories } from '@/hooks/useCategories';
import { CategoryManagementDialog } from '@/components/CategoryManagementDialog';
import { ProductManagementDialog } from '@/components/ProductManagementDialog';
import { SiteSettingsDialog } from '@/components/SiteSettingsDialog';

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
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isVideoEditDialogOpen, setIsVideoEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();

  // ===== User & Admin =====
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) checkIfAdmin(user);
    };
    fetchUser();
  }, []);

  const checkIfAdmin = async (user: any) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      setIsAdmin(profileData?.role === 'admin');
    } catch (error) {
      console.error(error);
    }
  };

  // ===== Fetch Products Gradually =====
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Load products gradually
      const chunkSize = 4; // عدد المنتجات لكل دفعة
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        setProducts(prev => [...prev, ...chunk]);
        await new Promise(res => setTimeout(res, 100)); // فاصل قصير لتدرج العرض
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===== Search =====
  const handleSearch = (query: string) => setSearchQuery(query);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.name_en && category.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ===== Dialog Handlers =====
  const handleAddCategory = () => { setEditingCategory(null); setIsCategoryDialogOpen(true); };
  const handleEditCategory = (category: any) => { setEditingCategory(category); setIsCategoryDialogOpen(true); };
  const handleAddProduct = () => setIsProductDialogOpen(true);
  const handleCategoryDialogSuccess = () => { refetchCategories(); toast({ title: 'نجح العمل', description: 'تم حفظ الفئة بنجاح' }); };
  const handleProductDialogSuccess = () => { fetchProducts(); toast({ title: 'نجح العمل', description: 'تم حفظ المنتج بنجاح' }); };

  // ===== Loading Screen =====
  if (categoriesLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل الفئات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={handleSearch} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            مرحباً بكم في متجر {settings.site_name_ar || 'بنات'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            أجمل الملابس النسائية والحقائب والعطور للسوق الموريتاني
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            <Button size="sm" asChild className="flex-1 min-w-[120px]">
              <Link to="#categories">تصفح المنتجات</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 min-w-[120px]">
              <Link to="/cart">سلة المشتريات</Link>
            </Button>
            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={handleAddProduct} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> إضافة منتج
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {searchQuery ? 'نتائج البحث' : 'الفئات الرئيسية'}
            </h2>
            {isAdmin && (
              <Button className="gap-2" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" /> إضافة فئة
              </Button>
            )}
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredCategories.map(category => (
              <CategoryCard key={category.id} category={category} isAdmin={isAdmin} onEdit={handleEditCategory} />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-semibold mb-4">المنتجات</h3>
          {loadingProducts ? (
            <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      loading="lazy" // Lazy load الصور
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h4 className="font-semibold text-foreground hover:text-primary">{product.name}</h4>
                    </Link>
                    <p className="text-primary font-bold mt-2">{product.price} أوقية</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Video */}
      {settings.main_video_url && (
        <section className="py-12 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 relative">
              <h2 className="text-3xl font-bold text-foreground mb-4">فيديو...</h2>
              <p className="text-muted-foreground">تعرفي أكثر على منتجاتنا</p>
              {isAdmin && (
                <Button size="sm" variant="outline" className="absolute top-0 left-0 gap-2"
                  onClick={() => setIsVideoEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" /> تحرير الفيديو
                </Button>
              )}
            </div>
            <MainVideo videoUrl={settings.main_video_url} className="mx-auto" />
          </div>
        </section>
      )}

      <Footer />

      {/* Dialogs */}
      <CategoryManagementDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        category={editingCategory}
        onSuccess={handleCategoryDialogSuccess}
      />
      <ProductManagementDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        product={null}
        categories={categories}
        onSuccess={handleProductDialogSuccess}
      />
      <SiteSettingsDialog
        open={isVideoEditDialogOpen}
        onOpenChange={setIsVideoEditDialogOpen}
      />
    </div>
  );
};

export default BanatIndex;
