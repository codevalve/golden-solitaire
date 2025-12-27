
import { Card, Suit, GameState } from './types';
import { SUITS, VALUES, VALUE_LABELS, getColor } from './constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const sessionNonce = Math.random().toString(36).substring(2, 7);
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({
        id: `${suit}-${value}-${sessionNonce}`,
        suit,
        value,
        label: VALUE_LABELS[value],
        isFaceUp: false,
        color: getColor(suit)
      });
    });
  });
  return deck;
};

export const shuffle = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealNewGame = (): GameState => {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  
  let currentCardIndex = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = { ...deck[currentCardIndex++] };
      if (i === j) card.isFaceUp = true;
      tableau[j].push(card);
    }
  }

  const stock = deck.slice(currentCardIndex).map(c => ({ ...c, isFaceUp: false }));

  return {
    stock,
    waste: [],
    foundation: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: []
    },
    tableau,
    moves: 0,
    time: 0,
    isWon: false
  };
};

export const canMoveToFoundation = (card: Card, foundation: Card[]): boolean => {
  if (foundation.length === 0) {
    return card.value === 1; // Ace
  }
  const topCard = foundation[foundation.length - 1];
  return card.suit === topCard.suit && card.value === topCard.value + 1;
};

export const canMoveToTableau = (card: Card, targetPile: Card[]): boolean => {
  if (targetPile.length === 0) {
    return card.value === 13; // King
  }
  const topCard = targetPile[targetPile.length - 1];
  return topCard.isFaceUp && card.color !== topCard.color && card.value === topCard.value - 1;
};

export interface AutoMoveTarget {
  type: 'foundation' | 'tableau';
  index: number | Suit;
}

export const findAutoMoveTarget = (card: Card, gameState: GameState, sourceInfo: { source: 'waste' | 'tableau', index: number, cardIndex?: number }): AutoMoveTarget | null => {
  const sourcePile = sourceInfo.source === 'waste' ? gameState.waste : gameState.tableau[sourceInfo.index];
  const cardIdx = sourceInfo.cardIndex ?? (sourcePile.length - 1);
  
  // Only the top card can move to foundation
  if (cardIdx === sourcePile.length - 1) {
    if (canMoveToFoundation(card, gameState.foundation[card.suit])) {
      return { type: 'foundation', index: card.suit };
    }
  }

  // Check Tableau
  for (let i = 0; i < 7; i++) {
    if (sourceInfo.source === 'tableau' && i === sourceInfo.index) continue;
    if (canMoveToTableau(card, gameState.tableau[i])) {
      return { type: 'tableau', index: i };
    }
  }

  return null;
};

export const checkWin = (foundation: GameState['foundation']): boolean => {
  return (
    foundation.hearts.length === 13 &&
    foundation.diamonds.length === 13 &&
    foundation.clubs.length === 13 &&
    foundation.spades.length === 13
  );
};
