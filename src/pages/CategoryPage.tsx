import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Plus, Edit, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { ProductActions } from '@/components/ProductActions';
import { CartIcon } from '@/components/CartIcon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductManagementDialog } from '@/components/ProductManagementDialog';
import { useCategories } from '@/hooks/useCategories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
id: string;
name: string;
description: string;
price: number;
image_url: string;
video_url?: string;
product_link?: string;
category_id: string;
is_featured: boolean;
is_active: boolean;
rating: number;
rating_count: number;
category?: string;
}

interface Category {
id: string;
name: string;
name_en?: string;
image_url: string;
}

const CategoryPage: React.FC = () => {
const { id } = useParams<{ id: string }>();
const [category, setCategory] = useState<Category | null>(null);
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState<any>(null);
const [isAdmin, setIsAdmin] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
const { toast } = useToast();

const { categories } = useCategories();

useEffect(() => {
checkUser();
fetchCategoryAndProducts();
}, [id]);

const checkUser = async () => {
const { data: { user } } = await supabase.auth.getUser();
setUser(user);

if (user) {  
  const { data: profile } = await supabase  
    .from('profiles')  
    .select('role')  
    .eq('user_id', user.id)  
    .single();  
    
  setIsAdmin(profile?.role === 'admin');  
}

};

const fetchCategoryAndProducts = async () => {
try {
// Fetch category
const { data: categoryData, error: categoryError } = await supabase
.from('categories')
.select('*')
.eq('id', id)
.single();

if (categoryError) throw categoryError;  
  setCategory(categoryData);  

  // Fetch products in this category  
  const { data: productsData, error: productsError } = await supabase  
    .from('products')  
    .select('*')  
    .eq('category_id', id)  
    .eq('is_active', true)  
    .order('created_at', { ascending: false });  

  if (productsError) throw productsError;  
  setProducts(productsData || []);  
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

const handleAddProduct = () => {
setEditingProduct(null);
setIsProductDialogOpen(true);
};

const handleEditProduct = (product: Product) => {
setEditingProduct(product);
setIsProductDialogOpen(true);
};

const handleProductDialogSuccess = () => {
fetchCategoryAndProducts();
toast({
title: 'نجح العمل',
description: 'تم حفظ المنتج بنجاح',
});
};

// Filter products based on search query
const filteredProducts = products.filter(product =>
product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
(product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
);

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
<Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

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
            src={category.image_url}  
            alt={category.name}  
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-primary/20"  
          />  
        </div>  
        <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>  
        {category.name_en && (  
          <p className="text-lg text-muted-foreground">{category.name_en}</p>  
        )}
        
        {/* Search Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="البحث في المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>  
    </div>  
  </div>

  {/* Products Grid */}  
  <div className="container mx-auto px-4 py-8">  
    <div className="flex items-center justify-between mb-6">  
      <h2 className="text-xl font-semibold">
        المنتجات ({filteredProducts.length}
        {searchQuery && filteredProducts.length !== products.length && (
          <span className="text-muted-foreground"> من {products.length}</span>
        )})
      </h2>  
      {isAdmin && (  
        <Button className="gap-2" onClick={handleAddProduct}>  
          <Plus className="h-4 w-4" />  
          إضافة منتج  
        </Button>  
      )}  
    </div>

    {filteredProducts.length === 0 ? (  
      <div className="text-center py-12">  
        {searchQuery ? (
          <>
            <p className="text-muted-foreground text-lg mb-4">لا توجد منتجات تطابق البحث "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              مسح البحث
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-lg mb-4">لا توجد منتجات في هذه الفئة حالياً</p>  
            {isAdmin && (  
              <Button onClick={handleAddProduct}>  
                <Plus className="h-4 w-4 mr-2" />  
                إضافة أول منتج  
              </Button>  
            )}
          </>
        )}
      </div>  
    ) : (  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group relative overflow-hidden hover-scale">  
            {isAdmin && (  
              <Button  
                variant="ghost"  
                size="sm"  
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditProduct(product);
                }}
              >  
                <Edit className="h-4 w-4" />  
              </Button>  
            )}
              
            <Link to={`/product/${product.id}`} className="block">  
              <div className="aspect-square overflow-hidden">  
                <img  
                  src={product.image_url || '/placeholder.svg'}  
                  alt={product.name}  
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"  
                />  
              </div>  
            </Link>  
              
            <div className="p-4">  
              <Link to={`/product/${product.id}`}>  
                <h3 className="font-semibold text-lg text-foreground mb-2 hover:text-primary transition-colors">  
                  {product.name}  
                </h3>  
              </Link>  
                
              <div className="flex items-center justify-between mb-3">  
                <StarRating rating={product.rating} ratingCount={product.rating_count} />  
                <span className="text-lg font-bold text-primary">  
                  {product.price} أوقية  
                </span>  
              </div>  
                
              <ProductActions productId={product.id} />  
            </div>  
          </Card>  
        ))}  
      </div>  
    )}  
  </div>
  
  {/* Product Management Dialog */}
  <ProductManagementDialog
    isOpen={isProductDialogOpen}
    onClose={() => setIsProductDialogOpen(false)}
    product={editingProduct}
    categories={categories}
    onSuccess={handleProductDialogSuccess}
  />
  <Footer />
</div>

);
};

export default CategoryPage;
