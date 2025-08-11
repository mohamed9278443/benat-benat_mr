import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User as UserIcon, ArrowRight, Home } from "lucide-react"; // أضفنا أيقونة Home
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // ... (بقية الدوال handleSignUp, handleSignIn, handleGoogleSignIn تبقى كما هي)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* زر العودة إلى الصفحة الرئيسية في الأعلى */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
        >
          <Home className="h-4 w-4" />
          <span>العودة للرئيسية</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6"> {/* قللنا المسافة هنا */}
          <div className="flex flex-col justify-center items-center mb-3"> {/* قللنا المسافة هنا */}
            {/* العنوان داخل مربع أنيق */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* المربع الخلفي مع ظل خفيف جدًا */}
                <div className="bg-[#d11e72] rounded-lg w-32 h-32 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.1)]"></div>
              </div>
              
              {/* النص في وسط المربع */}
              <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32">
                <h1 className="text-xl font-bold text-white"> {/* قللنا حجم الخط */}
                  بنات
                </h1>
                <h2 className="text-sm font-semibold text-white tracking-wider mt-1"> {/* قللنا حجم الخط */}
                  BENAT
                </h2>
              </div>
            </div>
          </div>
          
          {/* النص التحتي المعدل بحجم أصغر */}
          <p className="text-gray-800 font-medium mt-3 text-sm"> {/* قللنا حجم الخط */}
            مرحبا بكم في بنات_benat
          </p>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-3"> {/* قللنا المسافة هنا */}
            <CardTitle className="text-center text-xl">تسجيل الدخول</CardTitle> {/* قللنا حجم الخط */}
            <CardDescription className="text-center text-sm"> {/* قللنا حجم الخط */}
              ادخل إلى حسابك للاستمتاع بتجربة تسوق مميزة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* ... (بقية الكود للتسجيل والدخول يبقى كما هو) ... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
