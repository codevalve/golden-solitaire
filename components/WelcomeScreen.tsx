
import React from 'react';
import ParticleCelebration from './ParticleCelebration';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-emerald-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      <ParticleCelebration count={60} />
      
      <div className="relative z-[210] flex flex-col items-center text-center max-w-lg">
        <div className="mb-6 scale-125">
          <span className="text-6xl sm:text-8xl drop-shadow-2xl">👑</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tighter">
          Golden <span className="text-yellow-400">Solitaire</span>
        </h1>
        <p className="text-xl sm:text-2xl text-emerald-100/80 mb-10 font-medium leading-relaxed">
          Traditional Klondike Solitaire.<br/>
          No ads. No tracking. Just the game.
        </p>
        
        <button 
          onClick={onStart}
          className="group relative bg-yellow-400 hover:bg-yellow-300 text-emerald-950 text-2xl sm:text-4xl font-black py-5 px-12 rounded-3xl shadow-[0_10px_0_0_#ca8a04] hover:shadow-[0_8px_0_0_#ca8a04] active:shadow-none active:translate-y-[10px] transition-all duration-150 flex items-center gap-4"
        >
          <span>START GAME</span>
          <i className="fa-solid fa-play text-xl sm:text-2xl group-hover:translate-x-1 transition-transform"></i>
        </button>
        
        <div className="mt-16 flex gap-6 text-emerald-300/50 text-sm">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Privacy First</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-heart"></i>
            <span>Senior Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
