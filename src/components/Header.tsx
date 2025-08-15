import React, { useState, useEffect } from "react";
import { ShoppingCart, User, Search, Menu, Settings, LogOut, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUser({
          id: userId,
          email: profile.email,
          full_name: profile.full_name,
        });
        setIsAdmin(profile.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
          aria-label="قائمة المستخدم"
          title="قائمة المستخدم"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <div className="px-2 py-1.5">
          <p className="font-medium">{user?.full_name || 'مستخدم'}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Heart className="w-4 h-4 ml-2" />
          المنتجات المفضلة
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AdminDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 p-2 relative group"
          aria-label="قائمة الإدارة"
          title="قائمة الإدارة"
        >
          <Settings className="w-6 h-6 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-primary-foreground/20 animate-pulse opacity-50 group-hover:opacity-30" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <div className="px-2 py-1.5">
          <p className="font-medium text-primary">المدير: {user?.full_name || 'مدير'}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin" className="w-full">
            <Settings className="w-4 h-4 ml-2" />
            لوحة التحكم الإدارية
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-lg" role="banner">
      <div className="container relative flex items-center justify-between h-16">
        {/* Cart في أقصى اليسار */}
        <div className="flex items-center gap-3">
          <Link to="/cart" aria-label="سلة المشتريات" title="سلة المشتريات" className="p-2 relative">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Logo في المنتصف */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex flex-col items-center leading-none">
            <span className="text-2xl font-bold text-primary-foreground">
              {settings.site_name || 'بــــــنات'}
            </span>
            <span className="text-sm font-light text-primary-foreground/90 tracking-wide">
              BANAT
            </span>
          </div>
        </div>

        {/* User Menu في أقصى اليمين */}
        <div className="flex items-center gap-3">
          {user ? (
            isAdmin ? <AdminDropdown /> : <UserDropdown />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
              onClick={() => navigate("/auth")}
              aria-label="تسجيل الدخول"
              title="تسجيل الدخول"
            >
              <User className="w-6 h-6 text-primary-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-primary-foreground/10 backdrop-blur-sm">
        <div className="container py-3">
          <div className="mx-auto w-full max-w-md relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/70 pointer-events-none" />
            <input
              type="search"
              placeholder="ابحث عن منتج"
              aria-label="البحث في المنتجات"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-md pr-12 pl-4 py-2 bg-primary-foreground/20 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:bg-primary-foreground/30 transition"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;