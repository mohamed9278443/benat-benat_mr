import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d11e72] animate-fade-out">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-2 animate-scale-in">بـــــــنات</h1>
          <p className="text-2xl font-medium animate-fade-in">BENAT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d11e72]">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-2 animate-scale-in">بـــــــنات</h1>
        <p className="text-2xl font-medium animate-fade-in">BENAT</p>
      </div>
    </div>
  );
};
