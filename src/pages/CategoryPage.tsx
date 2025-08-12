import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductActions } from '@/components/ProductActions';
import { CartIcon } from '@/components/CartIcon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: string;
  is_active?: boolean;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
  image_url?: string;
}

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchCategoryAndProducts();
  }, [id]);

  const checkUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const currentUser = (data as any)?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single();

        setIsAdmin((profile as any)?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('checkUser error', err);
    }
  };

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData as Category);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts((productsData as Product[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">الفئة غير موجودة</h1>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowRight className="h-5 w-5" />
              <span>العودة</span>
            </Link>

            <div className="text-center">
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.name_en && <p className="text-sm opacity-90">{category.name_en}</p>}
            </div>

            <div className="flex items-center gap-4">
              <CartIcon />
              {user ? (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                    الملف الشخصي
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Header */}
      <div className="bg-accent/50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="relative group inline-block">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <img
                src={category.image_url || '/placeholder-category.png'}
                alt={category.name}
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-primary/20"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
            {category.name_en && (
              <p className="text-lg text-muted-foreground">{category.name_en}</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">المنتجات ({products.length})</h2>
          {isAdmin && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">لا توجد منتجات في هذه الفئة حالياً</p>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول منتج
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            style={{ gridAutoRows: '1fr' }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative overflow-hidden flex flex-col"
              >
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {/* الصورة بإطار مستطيل ثابت */}
                <Link to={`/product/${product.id}`} className="block flex-shrink-0">
                  <div className="w-full h-52 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* وصف مختصر بخط صغير */}
                    {product.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* السعر وأيقونات الإجراءات */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary whitespace-nowrap">
                      {product.price} أوقية
                    </span>
                    <ProductActions productId={product.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
