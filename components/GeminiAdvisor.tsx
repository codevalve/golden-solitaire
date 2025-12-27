
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GameState, Card } from '../types';

interface GeminiAdvisorProps {
  gameState: GameState;
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ gameState }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const boardSummary = {
        wasteTop: gameState.waste.length > 0 ? gameState.waste[gameState.waste.length - 1].label + " of " + gameState.waste[gameState.waste.length - 1].suit : 'Empty',
        foundation: (Object.entries(gameState.foundation) as [string, Card[]][]).map(([suit, cards]) => `${suit}: ${cards.length > 0 ? cards[cards.length - 1].label : '0'}`),
        tableau: gameState.tableau.map((col, i) => `Col ${i + 1}: ${col.length > 0 ? col.filter(c => c.isFaceUp).map(c => c.label + ' of ' + c.suit).join(', ') : 'Empty'}`)
      };

      const prompt = `You are a helpful Solitaire assistant for a senior player. Here is the current game state:
      Waste Pile top: ${boardSummary.wasteTop}
      Foundations: ${boardSummary.foundation.join(', ')}
      Tableau: ${boardSummary.tableau.join('; ')}
      
      Please suggest the best next move or give a friendly piece of encouragement. Keep the tone warm, patient, and easy to understand. Max 2 sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setHint(response.text || "I'm thinking... try checking if any Aces can move up!");
    } catch (err) {
      console.error(err);
      setError("I'm resting right now, but you're doing great!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameState.moves === 0) setHint(null);
  }, [gameState.moves]);

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 sm:gap-4 text-emerald-100 flex-grow min-w-0">
        <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-emerald-700 rounded-full flex items-center justify-center shadow-inner">
          <i className={`fa-solid fa-lightbulb text-sm sm:text-2xl ${loading ? 'animate-pulse text-yellow-300' : 'text-yellow-400'}`}></i>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="hidden sm:block font-bold text-[10px] sm:text-sm text-emerald-400 uppercase tracking-widest">AI Advisor</span>
          <p className="text-sm sm:text-lg leading-snug truncate sm:whitespace-normal">
            {loading ? "Thinking..." : 
             error ? error :
             hint ? hint : "Need a hint?"}
          </p>
        </div>
      </div>
      
      <button 
        onClick={getAdvice}
        disabled={loading}
        className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-1.5 px-3 sm:py-3 sm:px-8 text-xs sm:text-base rounded-lg sm:rounded-2xl shadow-lg transition-all active:scale-95 flex items-center"
      >
        {loading ? <i className="fa-solid fa-spinner fa-spin mr-1 sm:mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-1 sm:mr-2"></i>}
        <span>Hint</span>
      </button>
    </div>
  );
};

export default GeminiAdvisor;
