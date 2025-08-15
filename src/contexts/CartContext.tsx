import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

interface GuestCartItem {
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Guest cart storage keys
  const GUEST_CART_KEY = 'banat_guest_cart';

  // Helper functions for guest cart
  const getGuestCart = (): GuestCartItem[] => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return [];
    }
  };

  const setGuestCart = (cartItems: GuestCartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const clearGuestCart = () => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error('Error clearing guest cart:', error);
    }
  };

  // Fetch product details by ID
  const fetchProductDetails = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  };

  // Convert guest cart to cart items format
  const convertGuestCartToItems = async (guestCart: GuestCartItem[]): Promise<CartItem[]> => {
    const cartItems: CartItem[] = [];
    for (const item of guestCart) {
      cartItems.push({
        id: `guest_${item.product_id}`,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product
      });
    }
    return cartItems;
  };

  // Merge guest cart with user cart when logging in
  const mergeGuestCartWithUserCart = async (user: any) => {
    try {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) return;

      // Fetch existing user cart from database
      const { data: userCart, error } = await supabase
        .from('cart')
        .select('product_id, quantity')
        .eq('user_id', user.id);

      if (error) throw error;

      // Merge carts
      for (const guestItem of guestCart) {
        const existingUserItem = userCart?.find(item => item.product_id === guestItem.product_id);
        
        if (existingUserItem) {
          // Update quantity (combine guest + user quantities)
          await supabase
            .from('cart')
            .update({ quantity: existingUserItem.quantity + guestItem.quantity })
            .eq('user_id', user.id)
            .eq('product_id', guestItem.product_id);
        } else {
          // Insert new item from guest cart
          await supabase
            .from('cart')
            .insert({
              user_id: user.id,
              product_id: guestItem.product_id,
              quantity: guestItem.quantity
            });
        }
      }

      // Clear guest cart after merge
      clearGuestCart();
    } catch (error) {
      console.error('Error merging guest cart:', error);
    }
  };

  // Fetch cart items (from DB for users, localStorage for guests)
  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch from database for logged-in users
        const { data, error } = await supabase
          .from('cart')
          .select(`
            id,
            product_id,
            quantity,
            products:product_id (
              id,
              name,
              price,
              image_url
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const cartItems = data?.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: item.products as any
        })) || [];

        setItems(cartItems);
      } else {
        // Fetch from localStorage for guests
        const guestCart = getGuestCart();
        const cartItems = await convertGuestCartToItems(guestCart);
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - use database
        const existingItem = items.find(item => item.product_id === productId);
        
        if (existingItem) {
          await updateQuantity(productId, existingItem.quantity + 1);
        } else {
          const { error } = await supabase
            .from('cart')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: 1
            });

          if (error) throw error;
          await fetchCartItems();
        }
      } else {
        // Guest user - use localStorage
        const product = await fetchProductDetails(productId);
        if (!product) {
          throw new Error('المنتج غير موجود');
        }

        const guestCart = getGuestCart();
        const existingItemIndex = guestCart.findIndex(item => item.product_id === productId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          guestCart[existingItemIndex].quantity += 1;
        } else {
          // Add new item
          guestCart.push({
            product_id: productId,
            quantity: 1,
            product: product
          });
        }
        
        setGuestCart(guestCart);
        await fetchCartItems(); // Refresh the display
      }

      toast({
        title: "تمت الإضافة للسلة",
        description: "تم إضافة المنتج إلى سلة المشتريات بنجاح",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتج للسلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - remove from database
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Guest user - remove from localStorage
        const guestCart = getGuestCart();
        const updatedCart = guestCart.filter(item => item.product_id !== productId);
        setGuestCart(updatedCart);
      }

      await fetchCartItems();

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج من السلة",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (user) {
        // User is logged in - update in database
        const { error } = await supabase
          .from('cart')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Guest user - update in localStorage
        const guestCart = getGuestCart();
        const itemIndex = guestCart.findIndex(item => item.product_id === productId);
        
        if (itemIndex >= 0) {
          guestCart[itemIndex].quantity = quantity;
          setGuestCart(guestCart);
        }
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الكمية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Clear database cart for logged-in users
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Clear localStorage cart for guests
        clearGuestCart();
      }

      setItems([]);

      toast({
        title: "تم تفريغ السلة",
        description: "تم حذف جميع المنتجات من السلة",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تفريغ السلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  useEffect(() => {
    fetchCartItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Merge guest cart with user cart when logging in
        await mergeGuestCartWithUserCart(session.user);
        await fetchCartItems();
      } else if (event === 'SIGNED_OUT') {
        // Keep guest cart when signing out
        await fetchCartItems();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};