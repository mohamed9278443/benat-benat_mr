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
  features?: string[]; // إضافة حقول الميزات السريعة
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

  if (loading) return (/*...محتوى التحميل كما السابق...*/);

  if (!category) return (/*...محتوى الأخطاء كما السابق...*/);

  return (
    <div className="min-h-screen bg-background">
      {/* الجزء العلوي من الصفحة كما في الكود السابق */}
      {/* ... */}
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
          /*...محتوى لا توجد منتجات...*/
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" style={{ gridAutoRows: '1fr' }}>
            {products.map((product) => (
              <Card key={product.id} className="group relative overflow-hidden flex flex-col">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                <Link to={`/product/${product.id}`} className="block flex-shrink-0">
                  <div className="w-full h-52 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                    <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {product.features?.length ? (
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-2">
                      {product.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  ) : null}

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary whitespace-nowrap">{product.price} أوقية</span>
                    <div className="w-full sm:w-auto">
                      <ProductActions productId={product.id} />
                    </div>
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
