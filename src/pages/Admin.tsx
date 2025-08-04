import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Save, X, Upload, Settings, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url: string;
  product_link: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  created_by: string;
}

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    video_url: "",
    product_link: "",
    category: "",
    is_featured: false,
    is_active: true,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => {
            checkAdminAccess(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminAccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAccess = async (user: User) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !profileData || profileData.role !== 'admin') {
        toast({
          title: "غير مخول",
          description: "ليس لديك صلاحية للوصول إلى لوحة التحكم",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProfile(profileData);
      fetchProducts();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المنتجات",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      video_url: "",
      product_link: "",
      category: "",
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      video_url: product.video_url || "",
      product_link: product.product_link || "",
      category: product.category || "",
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المنتج والسعر على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        video_url: formData.video_url,
        product_link: formData.product_link,
        category: formData.category,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        created_by: user?.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({
          title: "تم التحديث",
          description: "تم تحديث المنتج بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({
          title: "تم الإضافة",
          description: "تم إضافة المنتج بنجاح",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ المنتج",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                لوحة تحكم الإدارة
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                مدير
              </Badge>
              <span className="text-sm text-muted-foreground">
                مرحباً، {profile.full_name || profile.email}
              </span>
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للموقع
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-amber-600">{products.length}</p>
                </div>
                <Sparkles className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المنتجات المميزة</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {products.filter(p => p.is_featured).length}
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">مميز</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المنتجات النشطة</p>
                  <p className="text-3xl font-bold text-green-600">
                    {products.filter(p => p.is_active).length}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? "قم بتعديل بيانات المنتج" : "أدخل بيانات المنتج الجديد"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المنتج *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="اسم العطر"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (ر.س) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="299.99"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف المنتج..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="عود، عنبر، مسك..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">رابط الصورة</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">رابط الفيديو</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_link">رابط المنتج</Label>
                  <Input
                    id="product_link"
                    type="url"
                    value={formData.product_link}
                    onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>

                <Separator />

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">منتج مميز</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">منتج نشط</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>
              يمكنك إضافة وتعديل وحذف المنتجات من هنا
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-200">
                    <th className="text-right p-4 font-semibold">الصورة</th>
                    <th className="text-right p-4 font-semibold">الاسم</th>
                    <th className="text-right p-4 font-semibold">الفئة</th>
                    <th className="text-right p-4 font-semibold">السعر</th>
                    <th className="text-right p-4 font-semibold">الحالة</th>
                    <th className="text-center p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-amber-100 hover:bg-amber-50/50">
                      <td className="p-4">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.is_featured && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                              مميز
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{product.category || "غير محدد"}</td>
                      <td className="p-4 font-semibold text-amber-600">
                        {product.price} ر.س
                      </td>
                      <td className="p-4">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا توجد منتجات حتى الآن</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ابدأ بإضافة منتجك الأول
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;