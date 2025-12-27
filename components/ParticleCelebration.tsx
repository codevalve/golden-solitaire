
import React, { useMemo } from 'react';
import { SUIT_SYMBOLS } from '../constants';
import { Suit } from '../types';

interface ParticleCelebrationProps {
  count?: number;
}

const ParticleCelebration: React.FC<ParticleCelebrationProps> = ({ count = 50 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 800;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const rotation = Math.random() * 720 - 360;
      const duration = 2 + Math.random() * 2;
      const delay = Math.random() * 0.8;
      const suit = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)] as Suit;
      const size = 24 + Math.random() * 48;
      const isCard = Math.random() > 0.4;
      
      return {
        id: i,
        x,
        y,
        rotation,
        duration,
        delay,
        symbol: SUIT_SYMBOLS[suit],
        color: (suit === 'hearts' || suit === 'diamonds') ? 'text-red-500' : 'text-slate-800',
        size,
        isCard
      };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[150] flex items-center justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute animate-win-particle flex items-center justify-center transition-opacity`}
          style={{
            '--tw-translate-x': `${p.x}px`,
            '--tw-translate-y': `${p.y}px`,
            '--tw-rotate': `${p.rotation}deg`,
            '--duration': `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            fontSize: `${p.size}px`,
            width: p.isCard ? `${p.size * 0.7}px` : 'auto',
            height: p.isCard ? `${p.size}px` : 'auto',
            backgroundColor: p.isCard ? 'white' : 'transparent',
            borderRadius: p.isCard ? '8px' : '0',
            boxShadow: p.isCard ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
            border: p.isCard ? '1px solid #eee' : 'none',
            zIndex: p.isCard ? 10 : 5,
            color: p.isCard ? (p.color.includes('red') ? '#dc2626' : '#1e293b') : (p.color.includes('red') ? '#ef4444' : '#f8fafc')
          } as React.CSSProperties}
        >
          <span className={p.isCard ? '' : p.color}>{p.symbol}</span>
        </div>
      ))}
    </div>
  );
};

export default ParticleCelebration;
