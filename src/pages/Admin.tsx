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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Settings, ArrowRight, Sparkles, Settings2, FolderPlus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import ImageUpload from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";
import { SiteSettingsDialog } from "@/components/SiteSettingsDialog";
import { useCategories } from "@/hooks/useCategories";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url: string;
  product_link: string;
  category: string;
  category_id: string;
  is_featured: boolean;
  is_active: boolean;
  created_by: string;
  rating: number;
  rating_count: number;
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
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    video_url: "",
    product_link: "",
    category: "",
    category_id: "",
    is_featured: false,
    is_active: true,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    name_en: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading, updateCategory, createCategory, refetch: refetchCategories } = useCategories();

  useEffect(() => {
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

  const resetProductForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      video_url: "",
      product_link: "",
      category: "",
      category_id: "",
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      name_en: "",
      image_url: "",
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      video_url: product.video_url || "",
      product_link: product.product_link || "",
      category: product.category || "",
      category_id: product.category_id || "",
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setIsProductDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      name_en: category.name_en || "",
      image_url: category.image_url || "",
      display_order: category.display_order || 0,
      is_active: category.is_active,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
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
        category_id: formData.category_id || null,
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

      setIsProductDialogOpen(false);
      resetProductForm();
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

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث الفئة بنجاح",
        });
      } else {
        await createCategory(categoryFormData);
        toast({
          title: "تم الإضافة",
          description: "تم إضافة الفئة بنجاح",
        });
      }

      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      refetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف الفئة بنجاح",
      });
      refetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الفئة",
        variant: "destructive",
      });
    }
  };

  if (loading || categoriesLoading) {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-amber-600">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الفئات</p>
                  <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
                </div>
                <FolderPlus className="h-8 w-8 text-blue-600" />
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
                <Sparkles className="h-8 w-8 text-orange-600" />
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

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Button 
            onClick={() => setIsSettingsDialogOpen(true)}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Settings2 className="h-4 w-4 ml-2" />
            إعدادات الموقع
          </Button>
        </div>

        {/* Site Settings Dialog */}
        <SiteSettingsDialog 
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              إدارة المنتجات
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              إدارة الفئات
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>إدارة المنتجات</CardTitle>
                    <CardDescription>
                      يمكنك إضافة وتعديل وحذف المنتجات من هنا
                    </CardDescription>
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={resetProductForm}
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
                      
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">اسم المنتج *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="اسم المنتج"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">الفئة</Label>
                            <Select
                              value={formData.category_id}
                              onValueChange={(value) => {
                                const selectedCategory = categories.find(cat => cat.id === value);
                                setFormData({ 
                                  ...formData, 
                                  category_id: value,
                                  category: selectedCategory?.name || ""
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category_text">نص الفئة (اختياري)</Label>
                            <Input
                              id="category_text"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              placeholder="نص الفئة"
                            />
                          </div>
                        </div>

                        <ImageUpload
                          currentImageUrl={formData.image_url}
                          onImageUpload={(url) => setFormData({ ...formData, image_url: url })}
                          onImageRemove={() => setFormData({ ...formData, image_url: "" })}
                        />

                        <VideoUpload
                          currentVideoUrl={formData.video_url}
                          onVideoUpload={(url) => setFormData({ ...formData, video_url: url })}
                          onVideoRemove={() => setFormData({ ...formData, video_url: "" })}
                        />

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
                            onClick={() => setIsProductDialogOpen(false)}
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
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
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
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>إدارة الفئات</CardTitle>
                    <CardDescription>
                      يمكنك إضافة وتعديل وحذف الفئات من هنا
                    </CardDescription>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={resetCategoryForm}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة فئة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCategory ? "قم بتعديل بيانات الفئة" : "أدخل بيانات الفئة الجديدة"}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cat_name">اسم الفئة بالعربية *</Label>
                          <Input
                            id="cat_name"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            placeholder="اسم الفئة"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cat_name_en">اسم الفئة بالإنجليزية</Label>
                          <Input
                            id="cat_name_en"
                            value={categoryFormData.name_en}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name_en: e.target.value })}
                            placeholder="Category Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="display_order">ترتيب العرض</Label>
                          <Input
                            id="display_order"
                            type="number"
                            value={categoryFormData.display_order}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) })}
                            placeholder="0"
                          />
                        </div>

                        <ImageUpload
                          currentImageUrl={categoryFormData.image_url}
                          onImageUpload={(url) => setCategoryFormData({ ...categoryFormData, image_url: url })}
                          onImageRemove={() => setCategoryFormData({ ...categoryFormData, image_url: "" })}
                        />

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Switch
                            id="cat_is_active"
                            checked={categoryFormData.is_active}
                            onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, is_active: checked })}
                          />
                          <Label htmlFor="cat_is_active">فئة نشطة</Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCategoryDialogOpen(false)}
                          >
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          >
                            <Save className="h-4 w-4 ml-2" />
                            {editingCategory ? "حفظ التغييرات" : "إضافة الفئة"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-right p-4 font-semibold">الصورة</th>
                        <th className="text-right p-4 font-semibold">الاسم العربي</th>
                        <th className="text-right p-4 font-semibold">الاسم الإنجليزي</th>
                        <th className="text-right p-4 font-semibold">الترتيب</th>
                        <th className="text-right p-4 font-semibold">الحالة</th>
                        <th className="text-center p-4 font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-b border-amber-100 hover:bg-amber-50/50">
                          <td className="p-4">
                            {category.image_url && (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                          </td>
                          <td className="p-4 font-medium">{category.name}</td>
                          <td className="p-4 text-muted-foreground">{category.name_en || "-"}</td>
                          <td className="p-4">{category.display_order}</td>
                          <td className="p-4">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "نشط" : "غير نشط"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {categories.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">لا توجد فئات حتى الآن</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        ابدأ بإضافة فئتك الأولى
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;