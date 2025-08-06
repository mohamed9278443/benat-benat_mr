import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartIcon: React.FC = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={handleClick}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
};