
import React from 'react';

interface HeaderProps {
  moves: number;
  time: number;
  onUndo: () => void;
  onNewGame: () => void;
  canUndo: boolean;
}

const Header: React.FC<HeaderProps> = ({ moves, time, onUndo, onNewGame, canUndo }) => {
  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-emerald-800 text-white shadow-lg p-4 flex items-center justify-between border-b border-emerald-700">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span className="text-yellow-400">Golden</span> Solitaire
        </h1>
      </div>

      <div className="flex items-center gap-6 text-lg font-medium">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-900/50 px-3 py-1 rounded-full">
          <i className="fa-solid fa-clock text-yellow-500"></i>
          <span>{formatTime(time)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-900/50 px-3 py-1 rounded-full">
          <i className="fa-solid fa-arrows-up-down text-emerald-400"></i>
          <span>{moves} <span className="text-sm font-normal opacity-70">Moves</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${
            canUndo ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-emerald-900 text-emerald-700 cursor-not-allowed'
          }`}
          title="Undo Last Move"
        >
          <i className="fa-solid fa-rotate-left"></i>
          <span className="hidden md:inline">Undo</span>
        </button>
        <button
          onClick={() => {
            if (confirm('Start a new game? Current progress will be lost.')) {
              onNewGame();
            }
          }}
          className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 px-4 py-2 rounded-xl transition-all font-bold shadow-lg flex items-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-plus-circle"></i>
          <span className="hidden md:inline">New Game</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
