import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  name_en?: string;
  image_url: string;
  display_order: number;
}

interface CategoryCardProps {
  category: Category;
  isAdmin?: boolean;
  onEdit?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  isAdmin = false, 
  onEdit 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${category.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  return (
    <Card 
      className="relative group cursor-pointer hover-scale bg-card border border-border overflow-hidden"
      onClick={handleClick}
    >
      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {category.name}
        </h3>
        {category.name_en && (
          <p className="text-sm text-muted-foreground">
            {category.name_en}
          </p>
        )}
      </div>
    </Card>
  );
};