import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  ratingCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'sm',
  showNumber = true,
  ratingCount = 0
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const filled = index < Math.floor(rating);
          const partial = index === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <div key={index} className="relative">
              <Star 
                className={`${sizeClasses[size]} text-muted-foreground`}
                fill="none"
              />
              {(filled || partial) && (
                <Star 
                  className={`${sizeClasses[size]} absolute top-0 left-0 text-yellow-500`}
                  fill="currentColor"
                  style={{
                    clipPath: partial 
                      ? `inset(0 ${100 - (rating % 1) * 100}% 0 0)` 
                      : 'none'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {rating.toFixed(1)} {ratingCount > 0 && `(${ratingCount})`}
        </span>
      )}
    </div>
  );
};