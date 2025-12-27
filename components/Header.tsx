
import React from 'react';

interface HeaderProps {
  moves: number;
  time: number;
  onUndo: () => void;
  onNewGame: () => void;
  canUndo: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  moves, 
  time, 
  onUndo, 
  onNewGame, 
  canUndo, 
  soundEnabled, 
  onToggleSound 
}) => {
  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-emerald-800 text-white shadow-lg p-2 sm:p-4 flex items-center justify-between border-b border-emerald-700">
      <div className="flex items-center gap-2">
        <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
          <span className="text-xl sm:text-3xl" aria-hidden="true">👑</span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">Golden</span>
            <span>Solitaire</span>
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 text-sm sm:text-lg font-medium">
        <div className="flex items-center gap-1 sm:gap-2 bg-emerald-900/50 px-2 py-1 rounded-full">
          <i className="fa-solid fa-clock text-yellow-500 text-[10px] sm:text-base"></i>
          <span>{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-emerald-900/50 px-2 py-1 rounded-full">
          <i className="fa-solid fa-arrows-up-down text-emerald-400 text-[10px] sm:text-base"></i>
          <span>{moves}</span>
        </div>
        <button 
          onClick={onToggleSound}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
          title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
        >
          <i className={`fa-solid ${soundEnabled ? 'fa-volume-high text-yellow-400' : 'fa-volume-xmark text-slate-400'}`}></i>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition-all font-bold text-xs sm:text-base ${
            canUndo ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-emerald-900 text-emerald-700 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <i className="fa-solid fa-rotate-left"></i>
          <span className="hidden md:inline">Undo</span>
        </button>
        <button
          onClick={onNewGame}
          className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition-all font-bold shadow-lg flex items-center gap-1 active:scale-95 text-xs sm:text-base"
        >
          <i className="fa-solid fa-plus-circle"></i>
          <span className="hidden md:inline">New Game</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
