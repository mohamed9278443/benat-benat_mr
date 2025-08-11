import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("already been registered")) {
          toast({
            title: "حساب موجود",
            description: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "تم إنشاء الحساب",
          description: "تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "بيانات خاطئة",
            description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "مرحباً بك",
          description: "تم تسجيل الدخول بنجاح",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google OAuth Error:', error);
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message || "حدث خطأ أثناء تسجيل الدخول عبر Google",
          variant: "destructive",
        });
      } else {
        // OAuth will redirect, so we don't need to handle success here
        toast({
          title: "جارٍ إعادة التوجيه...",
          description: "سيتم توجيهك إلى Google للمصادقة",
        });
      }
    } catch (error: any) {
      console.error('Google OAuth Catch Error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول عبر Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4" dir="rtl">
  <d<div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4" dir="rtl">
  <div className="w-full max-w-md">
    <div className="text-center mb-8">
      <div className="flex flex-col justify-center items-center mb-4">
        <Sparkles className="h-10 w-10 text-amber-600 mb-3" />
        
        {/* العنوان داخل دائرة أنيقة */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* الدائرة الخلفية مع ظل خفيف جدًا */}
            <div className="bg-[#d11e72] rounded-full w-44 h-44 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"></div>
          </div>
          
          {/* النص في وسط الدائرة بدون الخط الفاصل */}
          <div className="relative z-10 flex flex-col items-center justify-center w-44 h-44">
            <h1 className="text-3xl font-bold text-white">
              بــــــنات
            </h1>
            <h2 className="text-xl font-semibold text-white tracking-wider mt-1">
              BENAT
            </h2>
          </div>
        </div>
      </div>
      
      {/* النص التحتي المعدل */}
      <p className="text-gray-800 font-medium mt-4">
        مرحبا بكم في بــــــنات_benat
      </p>
    </div>
    
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              ادخل إلى حسابك للاستمتاع بتجربة تسوق مميزة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        placeholder="example@domain.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    disabled={loading}
                  >
                    {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-amber-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-200 hover:bg-amber-50"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="ml-2 h-5 w-5" />
                    تسجيل الدخول عبر Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <div className="relative">
                      <UserIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pr-10"
                        placeholder="اكتب اسمك الكامل"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        placeholder="example@domain.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    disabled={loading}
                  >
                    {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب جديد"}
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-amber-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-200 hover:bg-amber-50"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="ml-2 h-5 w-5" />
                    إنشاء حساب عبر Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-amber-700 hover:text-amber-800"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
