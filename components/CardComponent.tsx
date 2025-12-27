
import React from 'react';
import { Card } from '../types';
import { SUIT_SYMBOLS } from '../constants';

interface CardProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  isDragging?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, className = '', isDragging = false }) => {
  if (!card.isFaceUp) {
    return (
      <div 
        onClick={onClick}
        className={`relative w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-white/20 bg-emerald-700 shadow-lg cursor-pointer flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 ${className}`}
      >
        <div className="w-10 h-16 sm:w-16 sm:h-24 rounded border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-2 gap-1 opacity-20">
            {[...Array(8)].map((_, i) => (
              <i key={i} className="fa-solid fa-diamond text-white text-[8px] sm:text-[12px]"></i>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const textColor = card.color === 'red' ? 'text-red-600' : 'text-slate-900';

  return (
    <div 
      onClick={onClick}
      className={`relative w-16 h-24 sm:w-24 sm:h-36 rounded-lg border border-gray-300 bg-white shadow-md cursor-pointer flex flex-col p-1 sm:p-2 transition-transform hover:-translate-y-1 active:scale-95 select-none ${textColor} ${className} ${isDragging ? 'z-50 opacity-90 scale-105 rotate-1' : ''}`}
    >
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm sm:text-2xl font-black">{card.label}</span>
        <span className="text-xs sm:text-lg">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-2xl sm:text-6xl opacity-20">{SUIT_SYMBOLS[card.suit]}</span>
      </div>

      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex flex-col items-end leading-none rotate-180">
        <span className="text-sm sm:text-2xl font-black">{card.label}</span>
        <span className="text-xs sm:text-lg">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
};

export default CardComponent;
