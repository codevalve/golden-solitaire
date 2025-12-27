
import React, { useState } from 'react';
import { GameState, MoveAction, Card } from '../types';
import { SUITS, SUIT_SYMBOLS } from '../constants';
import { canMoveToTableau, canMoveToFoundation } from '../gameEngine';
import CardComponent from './CardComponent';

interface BoardProps {
  gameState: GameState;
  onAction: (action: MoveAction) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onAction }) => {
  const [selected, setSelected] = useState<{ source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'tableau' | 'foundation', index: number | string } | null>(null);

  const handleCardClick = (source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number) => {
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
    const data = { source, index, cardIdx };
    e.dataTransfer.setData('application/solitaire-move', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    
    // Optional: set a custom drag image if we wanted to show the whole stack
    // For now, browser default for the single card is fine
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

  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6">
      {/* Top Row: Stock, Waste, Spacing, Foundations */}
      <div className="col-span-1 flex flex-col items-center">
        <div 
          onClick={() => { setSelected(null); onAction({ type: 'DRAW_CARD' }); }}
          className={`w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-emerald-600/50 bg-emerald-800/50 flex items-center justify-center cursor-pointer hover:bg-emerald-800 transition-colors ${gameState.stock.length === 0 ? 'opacity-30' : ''}`}
        >
          {gameState.stock.length > 0 ? (
             <CardComponent card={gameState.stock[0]} className="!hover:translate-y-0" />
          ) : (
            <i className="fa-solid fa-rotate-right text-3xl text-emerald-500"></i>
          )}
        </div>
        <span className="text-emerald-500 text-xs mt-1 font-bold">STOCK</span>
      </div>

      <div className="col-span-1 flex flex-col items-center">
        <div className="relative w-16 h-24 sm:w-24 sm:h-36">
          {gameState.waste.slice(-3).map((card, i, arr) => (
            <div 
              key={card.id} 
              className="absolute" 
              style={{ left: `${i * 12}px` }}
              onClick={() => handleCardClick('waste', 0)}
              onDragStart={(e) => i === arr.length - 1 && handleDragStart(e, 'waste', 0)}
            >
              <CardComponent 
                card={card} 
                draggable={i === arr.length - 1}
                className={`${isSelected('waste', 0) && i === arr.length - 1 ? 'ring-4 ring-yellow-400' : ''}`}
              />
            </div>
          ))}
        </div>
        <span className="text-emerald-500 text-xs mt-1 font-bold">WASTE</span>
      </div>

      <div className="col-span-1"></div>

      {SUITS.map((suit) => (
        <div key={suit} className="col-span-1 flex flex-col items-center">
          <div 
            onClick={() => handleCardClick('foundation', 0)}
            onDragOver={(e) => handleDragOver(e, 'foundation', suit)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'foundation', suit)}
            className={`relative w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
              isDragOver('foundation', suit) ? 'border-yellow-400 bg-emerald-700/50 scale-105' : 'border-emerald-600/30 bg-emerald-950/20'
            }`}
          >
            <span className="absolute text-3xl sm:text-5xl text-emerald-700 opacity-20">{SUIT_SYMBOLS[suit]}</span>
            {gameState.foundation[suit].length > 0 && (
              <CardComponent card={gameState.foundation[suit][gameState.foundation[suit].length - 1]} />
            )}
          </div>
          <span className="text-emerald-500 text-xs mt-1 font-bold uppercase">{suit}</span>
        </div>
      ))}

      {/* Tableau Row */}
      {gameState.tableau.map((column, colIdx) => (
        <div key={colIdx} className="col-span-1 min-h-[450px] flex flex-col items-center pt-8">
          <div 
            className={`relative w-full flex flex-col items-center transition-all h-full rounded-lg ${isDragOver('tableau', colIdx) ? 'bg-emerald-800/30 ring-2 ring-yellow-400/50' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'tableau', colIdx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'tableau', colIdx)}
            onClick={() => handleCardClick('tableau', colIdx)}
          >
            {column.length === 0 ? (
              <div 
                className="w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-emerald-700/50 bg-emerald-950/10 cursor-pointer"
              ></div>
            ) : (
              column.map((card, cardIdx) => (
                <div 
                  key={card.id} 
                  className="absolute transition-all"
                  style={{ top: `${cardIdx * 25}px`, zIndex: cardIdx }}
                  onClick={(e) => { e.stopPropagation(); handleCardClick('tableau', colIdx, cardIdx); }}
                  onDragStart={(e) => handleDragStart(e, 'tableau', colIdx, cardIdx)}
                >
                  <CardComponent 
                    card={card} 
                    draggable={card.isFaceUp}
                    className={`${isSelected('tableau', colIdx, cardIdx) ? 'ring-4 ring-yellow-400 z-50 shadow-2xl scale-105' : ''}`}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;
