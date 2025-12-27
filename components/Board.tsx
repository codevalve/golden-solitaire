
import React, { useState, useEffect } from 'react';
import { GameState, MoveAction, Card } from '../types';
import { SUITS, SUIT_SYMBOLS } from '../constants';
import CardComponent from './CardComponent';
import { playSound } from '../utils/audio';

interface BoardProps {
  gameState: GameState;
  onAction: (action: MoveAction) => void;
  soundEnabled: boolean;
}

const Board: React.FC<BoardProps> = ({ gameState, onAction, soundEnabled }) => {
  const [selected, setSelected] = useState<{ source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'tableau' | 'foundation', index: number | string } | null>(null);

  useEffect(() => {
    if (gameState.moves === 0) {
      setSelected(null);
      setDragOverTarget(null);
    }
  }, [gameState.moves]);

  const handleCardClick = (source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number) => {
    playSound('click', soundEnabled);
    if (!selected) {
      if (source === 'waste') {
        if (gameState.waste.length > 0) setSelected({ source, index });
      } else if (source === 'tableau') {
        const col = gameState.tableau[index];
        if (col.length > 0 && col[cardIdx!].isFaceUp) {
          setSelected({ source, index, cardIdx });
        }
      }
    } else {
      executeMove(selected, source, index);
      setSelected(null);
    }
  };

  const executeMove = (
    src: { source: string, index: number, cardIdx?: number }, 
    targetType: 'tableau' | 'foundation' | 'waste', 
    targetIndex: number | string
  ) => {
    if (targetType === 'foundation') {
      if (src.source === 'waste') {
        onAction({ type: 'MOVE_WASTE_TO_FOUNDATION' });
      } else if (src.source === 'tableau') {
        onAction({ type: 'MOVE_TABLEAU_TO_FOUNDATION', fromCol: src.index });
      }
    } else if (targetType === 'tableau') {
      const colIdx = typeof targetIndex === 'string' ? parseInt(targetIndex) : targetIndex;
      if (src.source === 'waste') {
        onAction({ type: 'MOVE_WASTE_TO_TABLEAU', toCol: colIdx });
      } else if (src.source === 'tableau') {
        onAction({ 
          type: 'MOVE_TABLEAU_TO_TABLEAU', 
          fromCol: src.index, 
          toCol: colIdx, 
          cardIndex: src.cardIdx! 
        });
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, source: 'waste' | 'tableau', index: number, cardIdx?: number) => {
    playSound('click', soundEnabled);
    if (source === 'tableau') {
        const card = gameState.tableau[index][cardIdx!];
        if (!card || !card.isFaceUp) {
            e.preventDefault();
            return;
        }
    }

    const data = { source, index, cardIdx };
    e.dataTransfer.setData('application/solitaire-move', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, type: 'tableau' | 'foundation', index: number | string) => {
    e.preventDefault();
    setDragOverTarget({ type, index });
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetType: 'tableau' | 'foundation', targetIndex: number | string) => {
    e.preventDefault();
    setDragOverTarget(null);
    const dataStr = e.dataTransfer.getData('application/solitaire-move');
    if (!dataStr) return;

    try {
      const src = JSON.parse(dataStr);
      executeMove(src, targetType, targetIndex);
    } catch (err) {
      console.error('Failed to parse drag data', err);
    }
  };

  const isSelected = (source: string, idx: number, cIdx?: number) => {
    if (!selected) return false;
    return selected.source === source && selected.index === idx && (cIdx === undefined || selected.cardIdx === cIdx);
  };

  const isDragOver = (type: string, idx: number | string) => {
    return dragOverTarget?.type === type && dragOverTarget?.index === idx;
  };

  const renderTableauStack = (colIdx: number, cardIdx: number) => {
    const column = gameState.tableau[colIdx];
    if (cardIdx >= column.length) return null;

    const card = column[cardIdx];
    const isFaceUp = card.isFaceUp;

    const faceUpOffset = 'clamp(18px, 4vw, 32px)';
    const faceDownOffset = 'clamp(10px, 2.5vw, 18px)';
    const offset = isFaceUp ? faceUpOffset : faceDownOffset;

    // Swift dealing animation delay based on position
    const animationDelay = gameState.moves === 0 ? `${(colIdx * 60) + (cardIdx * 30)}ms` : '0ms';
    const animationClass = gameState.moves === 0 ? 'animate-card-deal' : '';

    return (
      <div 
        key={card.id}
        className={`relative w-full ${animationClass}`}
        style={{ animationDelay }}
        draggable={isFaceUp}
        onDragStart={(e) => {
            handleDragStart(e, 'tableau', colIdx, cardIdx);
            e.stopPropagation();
        }}
        onClick={(e) => { 
            e.stopPropagation(); 
            handleCardClick('tableau', colIdx, cardIdx); 
        }}
      >
        <CardComponent 
          card={card} 
          draggable={isFaceUp}
          className={`${isSelected('tableau', colIdx, cardIdx) ? 'ring-2 sm:ring-4 ring-yellow-400 z-50 shadow-2xl scale-105' : ''}`}
        />
        
        <div 
            className="absolute left-0 w-full" 
            style={{ top: offset }}
        >
          {renderTableauStack(colIdx, cardIdx + 1)}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 w-full mx-auto">
      <div className="col-span-1 flex flex-col items-center">
        <div 
          onClick={() => { setSelected(null); onAction({ type: 'DRAW_CARD' }); }}
          className={`w-full aspect-[2/3] rounded-lg border-2 border-emerald-600/50 bg-emerald-800/50 flex items-center justify-center cursor-pointer hover:bg-emerald-800 transition-colors ${gameState.stock.length === 0 ? 'opacity-30' : ''} ${gameState.moves === 0 ? 'animate-card-deal' : ''}`}
          style={gameState.moves === 0 ? { animationDelay: '600ms' } : {}}
        >
          {gameState.stock.length > 0 ? (
             <CardComponent card={gameState.stock[0]} className="!hover:translate-y-0" />
          ) : (
            <i className="fa-solid fa-rotate-right text-xl sm:text-3xl text-emerald-500"></i>
          )}
        </div>
        <span className="text-emerald-500 text-[8px] sm:text-xs mt-1 font-bold">STOCK</span>
      </div>

      <div className="col-span-1 flex flex-col items-center">
        <div className="relative w-full aspect-[2/3]">
          {gameState.waste.slice(-3).map((card, i, arr) => (
            <div 
              key={card.id} 
              className="absolute w-full h-full" 
              style={{ left: `${i * 15}%` }}
              onClick={() => handleCardClick('waste', 0)}
              onDragStart={(e) => i === arr.length - 1 && handleDragStart(e, 'waste', 0)}
            >
              <CardComponent 
                card={card} 
                draggable={i === arr.length - 1}
                className={`${isSelected('waste', 0) && i === arr.length - 1 ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}`}
              />
            </div>
          ))}
        </div>
        <span className="text-emerald-500 text-[8px] sm:text-xs mt-1 font-bold">WASTE</span>
      </div>

      <div className="col-span-1"></div>

      {SUITS.map((suit) => (
        <div key={suit} className="col-span-1 flex flex-col items-center">
          <div 
            onClick={() => handleCardClick('foundation', 0)}
            onDragOver={(e) => handleDragOver(e, 'foundation', suit)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'foundation', suit)}
            className={`relative w-full aspect-[2/3] rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
              isDragOver('foundation', suit) ? 'border-yellow-400 bg-emerald-700/50 scale-105' : 'border-emerald-600/30 bg-emerald-950/20'
            }`}
          >
            <span className="absolute text-xl sm:text-4xl text-emerald-700 opacity-20">{SUIT_SYMBOLS[suit]}</span>
            {gameState.foundation[suit].length > 0 && (
              <CardComponent card={gameState.foundation[suit][gameState.foundation[suit].length - 1]} />
            )}
          </div>
          <span className="text-emerald-500 text-[8px] sm:text-[10px] md:text-xs mt-1 font-bold uppercase truncate w-full text-center">{suit}</span>
        </div>
      ))}

      {gameState.tableau.map((column, colIdx) => (
        <div key={colIdx} className="col-span-1 flex flex-col items-center pt-4 sm:pt-8">
          <div 
            className={`relative w-full flex flex-col items-center transition-all min-h-[100px] sm:min-h-[144px] rounded-lg ${isDragOver('tableau', colIdx) ? 'bg-emerald-800/30 ring-2 ring-yellow-400/50' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'tableau', colIdx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'tableau', colIdx)}
            onClick={() => handleCardClick('tableau', colIdx)}
          >
            {column.length === 0 ? (
              <div 
                className="w-full aspect-[2/3] rounded-lg border-2 border-dashed border-emerald-700/50 bg-emerald-950/10 cursor-pointer"
              ></div>
            ) : (
              <div className="w-full relative">
                {renderTableauStack(colIdx, 0)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;