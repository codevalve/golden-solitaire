
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Card, MoveAction } from './types';
import { dealNewGame, canMoveToFoundation, canMoveToTableau, checkWin } from './gameEngine';
import Board from './components/Board';
import Header from './components/Header';
import GeminiAdvisor from './components/GeminiAdvisor';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(dealNewGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setGameState(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveHistory = useCallback((state: GameState) => {
    setHistory(prev => [...prev.slice(-20), state]); // Keep last 20 moves
  }, []);

  const handleAction = useCallback((action: MoveAction) => {
    startTimer();
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      let moved = false;

      switch (action.type) {
        case 'RESET_GAME':
          stopTimer();
          return dealNewGame();

        case 'DRAW_CARD':
          if (newState.stock.length === 0) {
            newState.stock = newState.waste.reverse().map(c => ({ ...c, isFaceUp: false }));
            newState.waste = [];
          } else {
            const card = newState.stock.pop()!;
            card.isFaceUp = true;
            newState.waste.push(card);
          }
          moved = true;
          break;

        case 'MOVE_WASTE_TO_FOUNDATION': {
          const card = newState.waste[newState.waste.length - 1];
          if (card && canMoveToFoundation(card, newState.foundation[card.suit])) {
            newState.foundation[card.suit].push(newState.waste.pop()!);
            moved = true;
          }
          break;
        }

        case 'MOVE_WASTE_TO_TABLEAU': {
          const card = newState.waste[newState.waste.length - 1];
          if (card && canMoveToTableau(card, newState.tableau[action.toCol])) {
            newState.tableau[action.toCol].push(newState.waste.pop()!);
            moved = true;
          }
          break;
        }

        case 'MOVE_TABLEAU_TO_FOUNDATION': {
          const col = newState.tableau[action.fromCol];
          const card = col[col.length - 1];
          if (card && card.isFaceUp && canMoveToFoundation(card, newState.foundation[card.suit])) {
            newState.foundation[card.suit].push(col.pop()!);
            if (col.length > 0 && !col[col.length - 1].isFaceUp) {
              col[col.length - 1].isFaceUp = true;
            }
            moved = true;
          }
          break;
        }

        case 'MOVE_TABLEAU_TO_TABLEAU': {
          const sourceCol = newState.tableau[action.fromCol];
          const targetCol = newState.tableau[action.toCol];
          const cardsToMove = sourceCol.slice(action.cardIndex);
          const firstMovedCard = cardsToMove[0];

          if (canMoveToTableau(firstMovedCard, targetCol)) {
            newState.tableau[action.toCol] = [...targetCol, ...cardsToMove];
            newState.tableau[action.fromCol] = sourceCol.slice(0, action.cardIndex);
            
            const remaining = newState.tableau[action.fromCol];
            if (remaining.length > 0 && !remaining[remaining.length - 1].isFaceUp) {
              remaining[remaining.length - 1].isFaceUp = true;
            }
            moved = true;
          }
          break;
        }

        case 'UNDO':
          if (history.length > 0) {
            const lastState = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            return lastState;
          }
          return prev;
      }

      if (moved) {
        saveHistory(prev);
        newState.moves += 1;
        newState.isWon = checkWin(newState.foundation);
        if (newState.isWon) stopTimer();
        return newState;
      }

      return prev;
    });
  }, [history, saveHistory, startTimer, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return (
    <div className="min-h-screen flex flex-col font-sans max-w-5xl mx-auto shadow-2xl bg-emerald-900 overflow-hidden">
      <Header 
        moves={gameState.moves} 
        time={gameState.time} 
        onUndo={() => handleAction({ type: 'UNDO' })}
        onNewGame={() => handleAction({ type: 'RESET_GAME' })}
        canUndo={history.length > 0}
      />
      
      <main className="flex-grow relative p-4 md:p-8">
        <Board gameState={gameState} onAction={handleAction} />
        
        {gameState.isWon && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6 text-center">
            <div className="bg-white rounded-3xl p-10 shadow-2xl animate-bounce">
              <h2 className="text-5xl font-black text-emerald-700 mb-4">You Won!</h2>
              <p className="text-xl text-gray-600 mb-8">Excellent job! You've cleared the board.</p>
              <button 
                onClick={() => handleAction({ type: 'RESET_GAME' })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="p-4 bg-emerald-950/40 backdrop-blur-sm">
        <GeminiAdvisor gameState={gameState} />
      </div>
      
      <footer className="bg-emerald-950 p-3 text-emerald-400 text-sm text-center">
        Golden Solitaire &bull; Designed for Seniors &bull; Privacy First &bull; No Ads
      </footer>
    </div>
  );
};

export default App;
