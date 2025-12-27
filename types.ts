
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Color = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  value: number;
  label: string;
  isFaceUp: boolean;
  color: Color;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundation: {
    hearts: Card[];
    diamonds: Card[];
    clubs: Card[];
    spades: Card[];
  };
  tableau: Card[][];
  moves: number;
  time: number;
  isWon: boolean;
}

export type MoveAction = 
  | { type: 'DRAW_CARD' }
  | { type: 'MOVE_TABLEAU_TO_TABLEAU'; fromCol: number; toCol: number; cardIndex: number }
  | { type: 'MOVE_WASTE_TO_TABLEAU'; toCol: number }
  | { type: 'MOVE_WASTE_TO_FOUNDATION' }
  | { type: 'MOVE_TABLEAU_TO_FOUNDATION'; fromCol: number }
  | { type: 'AUTO_SOLVE_STEP' }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO' };
