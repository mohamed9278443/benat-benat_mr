import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductActionsProps {
  productId: string;
  className?: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ productId, className = '' }) => {
  const { addToCart, loading } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(productId);
  };

  const handleViewDetails = () => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleAddToCart}
        disabled={loading}
        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {loading ? 'جاري الإضافة...' : 'اطلب الآن'}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleViewDetails}
        className="px-3"
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
};