import React from 'react';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  streak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <div className="flex items-center space-x-1 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 text-orange-600 shadow-sm">
      <Flame className={`w-5 h-5 ${streak > 0 ? 'fill-orange-500 text-orange-600' : 'text-orange-300'}`} />
      <span className="font-bold text-lg">{streak}</span>
      <span className="text-xs font-medium uppercase text-orange-400">Day Streak</span>
    </div>
  );
};

export default StreakDisplay;
