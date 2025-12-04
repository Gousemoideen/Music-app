import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface KissCounterProps {
  count: number;
  triggerAnimation: boolean;
}

const KissCounter: React.FC<KissCounterProps> = ({ count, triggerAnimation }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (triggerAnimation) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [triggerAnimation, count]);

  return (
    <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-pink-100 sticky top-4 z-20 mx-auto w-max transition-transform hover:scale-105">
      <Heart 
        className={`w-8 h-8 text-rose-500 fill-rose-500 ${animating ? 'animate-wiggle' : ''}`} 
      />
      <span className="text-3xl font-bold text-rose-600 font-mono tracking-tighter">
        {count}
      </span>
      <span className="text-rose-400 text-sm font-medium uppercase tracking-wide ml-1">Kisses</span>
    </div>
  );
};

export default KissCounter;
