import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductActionsProps {
  productId: string;
  className?: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ 
  productId, 
  className = '' 
}) => {
  const { addToCart, loading } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(productId);
  };

  return (
    <div 
      className={`relative w-12 h-10 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* زر المعلومات - يظهر دائماً */}
      <Button
        variant="outline"
        className={`absolute top-0 left-0 w-10 h-10 p-0 transition-all duration-300 ${
          isHovered ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        title="معلومات المنتج"
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* زر الشراء - يظهر فقط عند التحويم */}
      <Button
        onClick={handleAddToCart}
        disabled={loading}
        className={`absolute top-0 left-0 w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        title={loading ? 'جاري الإضافة...' : 'أضف إلى السلة'}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="sr-only">اطلب الآن</span>
      </Button>
    </div>
  );
};
