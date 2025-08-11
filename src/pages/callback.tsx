import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; // تأكد من المسار الصحيح
import { useToast } from '@/components/ui/use-toast';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. جلب الجلسة من Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // 2. التحقق من الأخطاء
        if (error || !session?.user) {
          throw error || new Error('No session found');
        }

        // 3. إذا نجحت المصادقة
        toast({
          title: "تم التسجيل بنجاح",
          description: `مرحباً ${session.user.email}`,
        });
        
        // 4. إعادة التوجيه
        navigate('/');
      } catch (error) {
        toast({
          title: "خطأ في المصادقة",
          description: error.message,
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuth();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-[#d11e72]">جارٍ التحقق من بياناتك...</h2>
      </div>
    </div>
  );
}
