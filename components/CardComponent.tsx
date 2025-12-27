
import React from 'react';
import { Card } from '../types';
import { SUIT_SYMBOLS } from '../constants';

interface CardProps {
  card: Card;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  isDragging?: boolean;
  draggable?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  onDragStart, 
  className = '', 
  isDragging = false,
  draggable = false
}) => {
  if (!card.isFaceUp) {
    return (
      <div 
        onClick={onClick}
        className={`relative w-full aspect-[2/3] rounded sm:rounded-lg border border-white/20 bg-emerald-700 shadow-sm sm:shadow-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${className}`}
      >
        <div className="w-[70%] h-[70%] rounded border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-2 gap-0.5 sm:gap-1 opacity-20">
            {[...Array(6)].map((_, i) => (
              <i key={i} className="fa-solid fa-diamond text-white text-[6px] sm:text-[12px]"></i>
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
      onDragStart={onDragStart}
      draggable={draggable}
      className={`relative w-full aspect-[2/3] rounded sm:rounded-lg border border-gray-300 bg-white shadow-sm sm:shadow-md flex flex-col p-0.5 sm:p-1.5 transition-all duration-200 select-none ${textColor} ${className} ${
          draggable ? 'cursor-grab active:cursor-grabbing hover:shadow-xl' : 'cursor-default'
      } ${isDragging ? 'opacity-40 grayscale scale-95' : ''}`}
    >
      <div className="flex flex-col items-start leading-[0.8] sm:leading-none">
        <span className="text-[10px] sm:text-xl md:text-2xl font-black">{card.label}</span>
        <span className="text-[8px] sm:text-base md:text-lg">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xl sm:text-4xl md:text-6xl opacity-10 sm:opacity-20">{SUIT_SYMBOLS[card.suit]}</span>
      </div>

      <div className="absolute bottom-0.5 right-0.5 sm:bottom-1.5 sm:right-1.5 flex flex-col items-end leading-[0.8] sm:leading-none rotate-180">
        <span className="text-[10px] sm:text-xl md:text-2xl font-black">{card.label}</span>
        <span className="text-[8px] sm:text-base md:text-lg">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
};

export default CardComponent;
