
import React, { useState } from 'react';
import { GameState, MoveAction, Card } from '../types';
import { SUITS, SUIT_SYMBOLS } from '../constants';
import CardComponent from './CardComponent';

interface BoardProps {
  gameState: GameState;
  onAction: (action: MoveAction) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onAction }) => {
  const [selected, setSelected] = useState<{ source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number } | null>(null);

  const handleCardClick = (source: 'waste' | 'tableau' | 'foundation', index: number, cardIdx?: number) => {
    if (!selected) {
      // Pick up a card
      if (source === 'waste') {
        if (gameState.waste.length > 0) setSelected({ source, index });
      } else if (source === 'tableau') {
        const col = gameState.tableau[index];
        if (col.length > 0 && col[cardIdx!].isFaceUp) {
          setSelected({ source, index, cardIdx });
        }
      } else if (source === 'foundation') {
        // Rarely needed to move from foundation, but possible
      }
    } else {
      // Try to move to target
      if (source === 'foundation') {
        if (selected.source === 'waste') {
          onAction({ type: 'MOVE_WASTE_TO_FOUNDATION' });
        } else if (selected.source === 'tableau') {
          onAction({ type: 'MOVE_TABLEAU_TO_FOUNDATION', fromCol: selected.index });
        }
      } else if (source === 'tableau') {
        if (selected.source === 'waste') {
          onAction({ type: 'MOVE_WASTE_TO_TABLEAU', toCol: index });
        } else if (selected.source === 'tableau') {
          onAction({ 
            type: 'MOVE_TABLEAU_TO_TABLEAU', 
            fromCol: selected.index, 
            toCol: index, 
            cardIndex: selected.cardIdx! 
          });
        }
      }
      setSelected(null);
    }
  };

  const isSelected = (source: string, idx: number, cIdx?: number) => {
    if (!selected) return false;
    return selected.source === source && selected.index === idx && (cIdx === undefined || selected.cardIdx === cIdx);
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
            >
              <CardComponent 
                card={card} 
                className={`${isSelected('waste', 0) && i === arr.length - 1 ? 'ring-4 ring-yellow-400' : ''}`}
              />
            </div>
          ))}
        </div>
        <span className="text-emerald-500 text-xs mt-1 font-bold">WASTE</span>
      </div>

      <div className="col-span-1"></div> {/* Gap */}

      {SUITS.map((suit) => (
        <div key={suit} className="col-span-1 flex flex-col items-center">
          <div 
            onClick={() => handleCardClick('foundation', 0)}
            className="relative w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-emerald-600/30 bg-emerald-950/20 flex items-center justify-center cursor-pointer"
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
        <div key={colIdx} className="col-span-1 min-h-[400px] flex flex-col items-center pt-8">
          <div className="relative w-full flex flex-col items-center">
            {column.length === 0 ? (
              <div 
                onClick={() => handleCardClick('tableau', colIdx)}
                className="w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-emerald-700/50 bg-emerald-950/10 cursor-pointer"
              ></div>
            ) : (
              column.map((card, cardIdx) => (
                <div 
                  key={card.id} 
                  className="absolute transition-all"
                  style={{ top: `${cardIdx * 20}px`, zIndex: cardIdx }}
                  onClick={(e) => { e.stopPropagation(); handleCardClick('tableau', colIdx, cardIdx); }}
                >
                  <CardComponent 
                    card={card} 
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
