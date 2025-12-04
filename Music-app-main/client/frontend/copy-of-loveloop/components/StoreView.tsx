import React from 'react';
import { Gift as GiftType } from '../types';
import { Gift, Utensils, Moon, Video } from 'lucide-react';

interface StoreViewProps {
  kisses: number;
  onRedeem: (gift: GiftType) => void;
}

const StoreView: React.FC<StoreViewProps> = ({ kisses, onRedeem }) => {
  const gifts: GiftType[] = [
    { id: 'dinner', name: 'Home-Cooked Dinner', cost: 100, icon: 'utensils' },
    { id: 'massage', name: 'Full Body Massage', cost: 150, icon: 'moon' },
    { id: 'movie', name: 'Movie Night Choice', cost: 50, icon: 'video' },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'utensils': return <Utensils className="w-8 h-8 text-white" />;
      case 'moon': return <Moon className="w-8 h-8 text-white" />;
      case 'video': return <Video className="w-8 h-8 text-white" />;
      default: return <Gift className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div className="space-y-6 animate-pop">
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-6 rounded-3xl shadow-lg text-white mb-8">
        <h2 className="text-2xl font-bold mb-1">Rewards Store</h2>
        <p className="text-rose-100 opacity-90">Treat yourself with your hard-earned kisses!</p>
      </div>

      <div className="grid gap-4">
        {gifts.map((gift) => {
          const canAfford = kisses >= gift.cost;
          return (
            <div
              key={gift.id}
              className={`relative overflow-hidden bg-white p-5 rounded-2xl border border-rose-100 shadow-sm transition-all duration-300 flex items-center justify-between ${
                canAfford ? 'hover:shadow-md hover:border-rose-300' : 'opacity-60 grayscale-[0.5]'
              }`}
            >
              <div className="flex items-center space-x-4 z-10">
                <div className={`p-3 rounded-xl shadow-inner ${canAfford ? 'bg-rose-400' : 'bg-gray-300'}`}>
                  {getIcon(gift.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{gift.name}</h3>
                  <p className="text-sm text-rose-500 font-medium">{gift.cost} Kisses</p>
                </div>
              </div>
              
              <button
                onClick={() => canAfford && onRedeem(gift)}
                disabled={!canAfford}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 ${
                  canAfford
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-rose-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Redeem' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreView;
