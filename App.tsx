
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Card, MoveAction } from './types';
import { dealNewGame, canMoveToFoundation, canMoveToTableau, checkWin } from './gameEngine';
import Board from './components/Board';
import Header from './components/Header';
import ParticleCelebration from './components/ParticleCelebration';
import WelcomeScreen from './components/WelcomeScreen';
import { playSound } from './utils/audio';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(dealNewGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('solitaire_sound');
    return saved === null ? true : saved === 'true';
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('solitaire_sound', String(soundEnabled));
  }, [soundEnabled]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setGameState(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setHistory([]);
    setGameState(dealNewGame());
    setShowResetConfirm(false);
    playSound('riffle', soundEnabled);
  }, [stopTimer, soundEnabled]);

  const handleStartGame = useCallback(() => {
    setIsFirstLoad(false);
    resetGame();
  }, [resetGame]);

  const saveHistory = useCallback((state: GameState) => {
    setHistory(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(state))]); 
  }, []);

  const handleAction = useCallback((action: MoveAction) => {
    if (action.type === 'RESET_GAME') {
      if (gameState.moves > 0 && !gameState.isWon) {
        setShowResetConfirm(true);
      } else {
        resetGame();
      }
      return;
    }

    if (action.type === 'UNDO') {
      if (history.length > 0) {
        const lastState = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setGameState(lastState);
        playSound('click', soundEnabled);
      }
      return;
    }

    startTimer();
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      let moved = false;

      switch (action.type) {
        case 'DRAW_CARD':
          if (newState.stock.length === 0) {
            newState.stock = newState.waste.reverse().map(c => ({ ...c, isFaceUp: false }));
            newState.waste = [];
            playSound('riffle', soundEnabled);
          } else {
            const card = newState.stock.pop()!;
            card.isFaceUp = true;
            newState.waste.push(card);
            playSound('click', soundEnabled);
          }
          moved = true;
          break;

        case 'MOVE_WASTE_TO_FOUNDATION': {
          const card = newState.waste[newState.waste.length - 1];
          if (card && canMoveToFoundation(card, newState.foundation[card.suit])) {
            newState.foundation[card.suit].push(newState.waste.pop()!);
            moved = true;
            playSound('drop', soundEnabled);
          }
          break;
        }

        case 'MOVE_WASTE_TO_TABLEAU': {
          const card = newState.waste[newState.waste.length - 1];
          if (card && canMoveToTableau(card, newState.tableau[action.toCol])) {
            newState.tableau[action.toCol].push(newState.waste.pop()!);
            moved = true;
            playSound('drop', soundEnabled);
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
            playSound('drop', soundEnabled);
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
            playSound('drop', soundEnabled);
          }
          break;
        }
      }

      if (moved) {
        saveHistory(prev);
        newState.moves += 1;
        const isNowWon = checkWin(newState.foundation);
        if (isNowWon && !prev.isWon) {
          playSound('victory', soundEnabled);
        }
        newState.isWon = isNowWon;
        if (newState.isWon) stopTimer();
        return newState;
      }

      return prev;
    });
  }, [history, gameState.moves, gameState.isWon, saveHistory, startTimer, stopTimer, resetGame, soundEnabled]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return (
    <div className="min-h-screen flex flex-col font-sans max-w-5xl mx-auto shadow-2xl bg-emerald-900 overflow-hidden relative">
      {isFirstLoad && <WelcomeScreen onStart={handleStartGame} />}
      
      <Header 
        moves={gameState.moves} 
        time={gameState.time} 
        onUndo={() => handleAction({ type: 'UNDO' })}
        onNewGame={() => handleAction({ type: 'RESET_GAME' })}
        canUndo={history.length > 0}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
      
      <main className="flex-grow relative p-2 sm:p-4 md:p-8 overflow-y-auto">
        <Board gameState={gameState} onAction={handleAction} soundEnabled={soundEnabled} />
        
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border-4 border-yellow-500">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-circle-question text-3xl text-yellow-600"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">New Game?</h2>
              <p className="text-slate-600 mb-8">Are you sure you want to start over? Your current progress will be lost.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={resetGame}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  Yes, Start New Game
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl active:scale-95 transition-all"
                >
                  No, Keep Playing
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState.isWon && (
          <>
            <ParticleCelebration count={80} />
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-6 text-center">
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl animate-bounce max-w-sm w-full border-4 border-emerald-500">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl sm:text-5xl font-black text-emerald-700 mb-4">Victory!</h2>
                <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8">Amazing skill! You've cleared the board in {gameState.moves} moves.</p>
                <button 
                  onClick={resetGame}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg sm:text-2xl font-bold py-3 px-6 sm:py-4 sm:px-10 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-emerald-950 p-3 text-emerald-400 text-[10px] sm:text-xs text-center border-t border-emerald-900">
        Golden Solitaire &bull; Designed for Seniors &bull; Privacy First &bull; No Ads
      </footer>
    </div>
  );
};

export default App;
