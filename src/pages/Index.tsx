import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingCart, Star, User, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    checkUser();
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

  const checkIfAdmin = async (user: SupabaseUser) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (profileData?.role === 'admin') {
        setIsAdmin(true);
      }
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
        .order('is_featured', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل الخروج بنجاح",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-amber-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              عطور الجزيرة العربية
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/admin")}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Settings className="h-4 w-4 ml-2" />
                    لوحة التحكم
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">مرحباً، {user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default">
                <User className="h-4 w-4 ml-2" />
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            عطور فاخرة من قلب الجزيرة العربية
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            اكتشف مجموعتنا الحصرية من العطور العربية الأصيلة والعود الفاخر والعنبر الطبيعي
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <ShoppingCart className="h-5 w-5 ml-2" />
              تسوق الآن
            </Button>
            <Button variant="outline" size="lg">
              استكشف المجموعة
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            المنتجات المميزة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-amber-200">
                <CardHeader className="pb-4">
                  {product.image_url && (
                    <div className="aspect-square rounded-lg overflow-hidden mb-4">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-right">{product.name}</CardTitle>
                    {product.is_featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        مميز
                      </Badge>
                    )}
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="w-fit">
                      {product.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-right mb-4 text-base">
                    {product.description}
                  </CardDescription>
                  <div className="flex justify-between items-center">
                    <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                      <ShoppingCart className="h-4 w-4 ml-2" />
                      اطلب الآن
                    </Button>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-amber-600">
                        {product.price} ر.س
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            الفئات
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['عود', 'عنبر', 'مسك', 'ورد'].map((category) => (
              <Card key={category} className="text-center hover:shadow-lg transition-shadow cursor-pointer bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold">{category}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8" />
            <h3 className="text-2xl font-bold">عطور الجزيرة العربية</h3>
          </div>
          <p className="text-amber-100 mb-4">
            أجود أنواع العطور العربية والعود والعنبر الطبيعي
          </p>
          <div className="flex justify-center gap-4 text-sm text-amber-200">
            <span>جميع الحقوق محفوظة © 2024</span>
            <span>•</span>
            <span>صنع بـ ❤️ في المملكة العربية السعودية</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;